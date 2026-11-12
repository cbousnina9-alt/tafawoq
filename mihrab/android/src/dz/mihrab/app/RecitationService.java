package dz.mihrab.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/** Keeps the process alive while the page plays recitation, with a media notification that controls it. */
public class RecitationService extends Service {
    static final String CH = "recitation_v1";
    static final String ACTION_MEDIA = "dz.mihrab.app.MEDIA";
    static final int NOTIF_ID = 300;
    private PowerManager.WakeLock wake;

    @Override public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || intent.getBooleanExtra("stop", false)) { stopSelf(); return START_NOT_STICKY; }
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm.getNotificationChannel(CH) == null) {
            NotificationChannel ch = new NotificationChannel(CH, "تلاوة القرآن", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("التحكم في التلاوة أثناء تشغيلها");
            nm.createNotificationChannel(ch);
        }
        boolean playing = intent.getBooleanExtra("playing", true);
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        Notification.Builder b = new Notification.Builder(this, CH)
            .setSmallIcon(R.drawable.ic_stat)
            .setColor(0xFF0F4A3C)
            .setContentTitle(intent.getStringExtra("title"))
            .setContentText(intent.getStringExtra("text"))
            .setContentIntent(PendingIntent.getActivity(this, 5, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT))
            .setOnlyAlertOnce(true)
            .setOngoing(playing)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(action(10, "prev", "السابقة"))
            .addAction(action(11, "toggle", playing ? "إيقاف مؤقت" : "تشغيل"))
            .addAction(action(12, "next", "التالية"))
            .addAction(action(13, "stop", "إنهاء"));
        if (Build.VERSION.SDK_INT >= 29) startForeground(NOTIF_ID, b.build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(NOTIF_ID, b.build());
        if (playing) acquire(); else release();
        return START_NOT_STICKY;
    }

    private Notification.Action action(int code, String cmd, String label) {
        Intent i = new Intent(ACTION_MEDIA).setPackage(getPackageName()).putExtra("cmd", cmd);
        return new Notification.Action.Builder(null, label, PendingIntent.getBroadcast(this, code, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT)).build();
    }

    private void acquire() {
        if (wake != null && wake.isHeld()) return;
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "mihrab:recitation");
        wake.acquire(4 * 60 * 60 * 1000L);
    }

    private void release() { if (wake != null && wake.isHeld()) wake.release(); wake = null; }

    @Override
    public void onDestroy() {
        release();
        stopForeground(Service.STOP_FOREGROUND_REMOVE);
        super.onDestroy();
    }
}
