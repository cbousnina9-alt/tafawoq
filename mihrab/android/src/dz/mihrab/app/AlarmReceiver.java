package dz.mihrab.app;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent intent) {
        long t = intent.getLongExtra("t", 0);
        boolean fresh = Math.abs(System.currentTimeMillis() - t) < 10 * 60 * 1000;
        // When the app is on screen it plays the adhan itself.
        if (fresh && !MainActivity.visible) {
            Alarms.ensureChannels(c);
            boolean adhan = intent.getBooleanExtra("adhan", false);
            String title = intent.getStringExtra("title"), body = intent.getStringExtra("body");
            boolean started = false;
            if (adhan) {
                Intent svc = new Intent(c, AdhanService.class)
                    .putExtra("title", title).putExtra("body", body)
                    .putExtra("sound", intent.getStringExtra("sound"));
                try { c.startForegroundService(svc); started = true; } catch (Exception ignored) { }
            }
            if (!started) {
                Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                String page = intent.getStringExtra("open");
                if (page != null && !page.isEmpty()) open.putExtra("open", page);
                PendingIntent pi = PendingIntent.getActivity(c, 1, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
                Notification n = new Notification.Builder(c, adhan ? Alarms.CH_ADHAN : Alarms.CH_REMIND)
                    .setSmallIcon(R.drawable.ic_stat)
                    .setColor(0xFF0B5A4A)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setCategory(adhan ? Notification.CATEGORY_ALARM : Notification.CATEGORY_REMINDER)
                    .setContentIntent(pi)
                    .setAutoCancel(true)
                    .build();
                NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
                nm.notify(adhan ? 100 : 101, n);
            }
        }
        Alarms.scheduleNext(c);
        PrayerWidget.updateAll(c);
    }
}
