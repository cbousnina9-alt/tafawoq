package dz.mihrab.app;

import android.content.Context;
import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.webkit.WebView;

/** Heading in degrees from true north, pushed to the page as window.__mihrabHeading(deg, accuracy). */
final class Compass implements SensorEventListener {
    private final SensorManager sm;
    private final WebView web;
    private Sensor rv, acc, mag;
    private float declination;
    private boolean active;
    private long lastPush;
    private int accuracy = SensorManager.SENSOR_STATUS_ACCURACY_HIGH;
    private final float[] rot = new float[9], rot2 = new float[9], ori = new float[3], grav = new float[3], geo = new float[3];
    private boolean hasGrav, hasGeo;

    Compass(Context c, WebView w) {
        sm = (SensorManager) c.getSystemService(Context.SENSOR_SERVICE);
        web = w;
    }

    boolean start(double lat, double lng) {
        if (sm == null) return false;
        declination = new GeomagneticField((float) lat, (float) lng, 0f, System.currentTimeMillis()).getDeclination();
        rv = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        mag = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        acc = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        if (rv == null && (mag == null || acc == null)) return false;
        active = true;
        register();
        return true;
    }

    private void register() {
        sm.unregisterListener(this);
        if (rv != null) sm.registerListener(this, rv, SensorManager.SENSOR_DELAY_GAME);
        else sm.registerListener(this, acc, SensorManager.SENSOR_DELAY_GAME);
        if (mag != null) sm.registerListener(this, mag, SensorManager.SENSOR_DELAY_GAME);
    }

    void stop() { active = false; if (sm != null) sm.unregisterListener(this); }
    void pause() { if (sm != null) sm.unregisterListener(this); }
    void resume() { if (active) register(); }

    @Override
    public void onSensorChanged(SensorEvent e) {
        int type = e.sensor.getType();
        if (type == Sensor.TYPE_ROTATION_VECTOR) {
            SensorManager.getRotationMatrixFromVector(rot, e.values);
            push();
        } else if (type == Sensor.TYPE_ACCELEROMETER) {
            System.arraycopy(e.values, 0, grav, 0, 3); hasGrav = true;
            if (rv == null && hasGeo && SensorManager.getRotationMatrix(rot, null, grav, geo)) push();
        } else if (type == Sensor.TYPE_MAGNETIC_FIELD) {
            System.arraycopy(e.values, 0, geo, 0, 3); hasGeo = true;
        }
    }

    private void push() {
        long now = System.currentTimeMillis();
        if (now - lastPush < 40) return;
        lastPush = now;
        SensorManager.getOrientation(rot, ori);
        // Phone held upright: measure along the back camera axis instead.
        if (Math.abs(ori[1]) > Math.toRadians(55)) {
            SensorManager.remapCoordinateSystem(rot, SensorManager.AXIS_X, SensorManager.AXIS_Z, rot2);
            SensorManager.getOrientation(rot2, ori);
        }
        float h = ((float) Math.toDegrees(ori[0]) + declination + 720f) % 360f;
        final String js = "window.__mihrabHeading&&window.__mihrabHeading(" + h + "," + accuracy + ")";
        web.post(() -> web.evaluateJavascript(js, null));
    }

    @Override
    public void onAccuracyChanged(Sensor s, int a) {
        if (s.getType() == Sensor.TYPE_MAGNETIC_FIELD) accuracy = a;
    }
}
