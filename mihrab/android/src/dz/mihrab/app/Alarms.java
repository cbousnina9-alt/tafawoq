package dz.mihrab.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

final class Alarms {
    static final String CH_ADHAN = "adhan_v1";
    static final String CH_REMIND = "reminder_v1";
    static final String CH_ADHAN_PLAY = "adhan_play_v2";
    private static final String PREFS = "mihrab";

    static void save(Context c, String json) {
        prefs(c).edit().putString("schedule", json).apply();
    }

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    /** Arms one alarm for the earliest future entry; the receiver arms the next one when it fires. */
    static void scheduleNext(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        Intent i = new Intent(c, AlarmReceiver.class);
        PendingIntent old = PendingIntent.getBroadcast(c, 0, i, PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
        if (old != null) am.cancel(old);
        try {
            JSONArray arr = new JSONArray(prefs(c).getString("schedule", "[]"));
            long now = System.currentTimeMillis();
            for (int k = 0; k < arr.length(); k++) {
                JSONObject o = arr.getJSONObject(k);
                long t = o.getLong("t");
                if (t <= now + 1000) continue;
                i.putExtra("title", o.optString("title"));
                i.putExtra("body", o.optString("body"));
                i.putExtra("adhan", o.optBoolean("adhan", false));
                i.putExtra("sound", o.optString("sound", "adhan1"));
                i.putExtra("t", t);
                PendingIntent pi = PendingIntent.getBroadcast(c, 0, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                boolean exact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms();
                if (exact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
                else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
                return;
            }
        } catch (Exception ignored) { }
    }

    static void ensureChannels(Context c) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm.getNotificationChannel(CH_ADHAN) == null) {
            NotificationChannel ch = new NotificationChannel(CH_ADHAN, "الأذان (احتياطي)", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("تنبيه بصوت الأذان عند دخول وقت كل صلاة");
            Uri sound = Uri.parse("android.resource://" + c.getPackageName() + "/" + R.raw.adhan);
            AudioAttributes aa = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
            ch.setSound(sound, aa);
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[]{0, 300, 150, 300});
            nm.createNotificationChannel(ch);
        }
        if (nm.getNotificationChannel(CH_ADHAN_PLAY) == null) {
            NotificationChannel ch = new NotificationChannel(CH_ADHAN_PLAY, "أذان الصلوات", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("إشعار دخول وقت الصلاة أثناء تشغيل الأذان");
            ch.setSound(null, null);
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[]{0, 300, 150, 300});
            nm.createNotificationChannel(ch);
        }
        if (nm.getNotificationChannel(CH_REMIND) == null) {
            NotificationChannel ch = new NotificationChannel(CH_REMIND, "التذكير قبل الصلاة", NotificationManager.IMPORTANCE_DEFAULT);
            nm.createNotificationChannel(ch);
        }
    }
}
