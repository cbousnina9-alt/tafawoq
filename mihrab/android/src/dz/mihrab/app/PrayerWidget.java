package dz.mihrab.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/** Home-screen widget: next prayer with a live countdown and the five prayer times of its day. */
public class PrayerWidget extends AppWidgetProvider {
    static final String ACTION_TICK = "dz.mihrab.app.WIDGET_TICK";
    private static final String[] FARD = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
    private static final int[] CELL = {R.id.w_c0, R.id.w_c1, R.id.w_c2, R.id.w_c3, R.id.w_c4};
    private static final int[] NAME = {R.id.w_n0, R.id.w_n1, R.id.w_n2, R.id.w_n3, R.id.w_n4};
    private static final int[] TIME = {R.id.w_t0, R.id.w_t1, R.id.w_t2, R.id.w_t3, R.id.w_t4};

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c, m, ids); }

    @Override
    public void onReceive(Context c, Intent i) {
        super.onReceive(c, i);
        if (ACTION_TICK.equals(i.getAction())) updateAll(c);
    }

    static void save(Context c, String json) {
        Alarms.prefs(c).edit().putString("widget", json).apply();
        updateAll(c);
    }

    static void updateAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, PrayerWidget.class));
        if (ids != null && ids.length > 0) render(c, m, ids);
    }

    private static boolean isFard(String k) {
        for (String f : FARD) if (f.equals(k)) return true;
        return false;
    }

    static void render(Context c, AppWidgetManager m, int[] ids) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_prayer);
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        v.setOnClickPendingIntent(R.id.w_root, PendingIntent.getActivity(c, 4, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
        long now = System.currentTimeMillis();
        long nextChange = now + 30 * 60 * 1000L;
        try {
            JSONObject data = new JSONObject(Alarms.prefs(c).getString("widget", "{}"));
            JSONArray days = data.optJSONArray("days");
            v.setTextViewText(R.id.w_place, data.optString("place", "مِحراب"));
            JSONObject next = null, day = null;
            for (int d = 0; days != null && d < days.length() && next == null; d++) {
                JSONArray times = days.getJSONObject(d).getJSONArray("times");
                for (int k = 0; k < times.length(); k++) {
                    JSONObject t = times.getJSONObject(k);
                    if (isFard(t.optString("k")) && t.getLong("t") > now) { next = t; day = days.getJSONObject(d); break; }
                }
            }
            if (next == null) {
                v.setTextViewText(R.id.w_next, "افتح التطبيق");
                v.setTextViewText(R.id.w_at, "لتحديث المواقيت");
                v.setChronometer(R.id.w_count, SystemClock.elapsedRealtime(), "", false);
            } else {
                long left = next.getLong("t") - now;
                v.setTextViewText(R.id.w_next, next.optString("n"));
                v.setTextViewText(R.id.w_at, "الأذان " + next.optString("s"));
                v.setTextViewText(R.id.w_hijri, day.optString("h"));
                v.setChronometer(R.id.w_count, SystemClock.elapsedRealtime() + left, null, true);
                v.setChronometerCountDown(R.id.w_count, true);
                JSONArray times = day.getJSONArray("times");
                int ci = 0;
                for (int k = 0; k < times.length() && ci < 5; k++) {
                    JSONObject t = times.getJSONObject(k);
                    if (!isFard(t.optString("k"))) continue;
                    boolean on = t.optString("k").equals(next.optString("k"));
                    v.setTextViewText(NAME[ci], t.optString("n"));
                    v.setTextViewText(TIME[ci], t.optString("s"));
                    v.setInt(CELL[ci], "setBackgroundResource", on ? R.drawable.widget_cell_on : R.drawable.widget_cell_off);
                    v.setTextColor(NAME[ci], on ? 0xFF0D4034 : 0xFFCFE3D8);
                    v.setTextColor(TIME[ci], on ? 0xFF0D4034 : 0xFFFFFFFF);
                    ci++;
                }
                nextChange = next.getLong("t") + 1000;
            }
        } catch (Exception ignored) { }
        for (int id : ids) m.updateAppWidget(id, v);
        schedule(c, nextChange);
    }

    private static void schedule(Context c, long at) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        Intent i = new Intent(c, PrayerWidget.class).setAction(ACTION_TICK);
        PendingIntent pi = PendingIntent.getBroadcast(c, 3, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        am.set(AlarmManager.RTC, at, pi);
    }
}
