package dz.mihrab.app;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import java.io.File;

/** Plays the adhan in the foreground, with a notification that can stop it. */
public class AdhanService extends Service implements MediaPlayer.OnCompletionListener, MediaPlayer.OnErrorListener {
    static final String ACTION_STOP = "dz.mihrab.app.STOP_ADHAN";
    static final int NOTIF_ID = 200;
    static volatile boolean playing = false;

    private MediaPlayer player;
    private AudioFocusRequest focus;
    private String title = "", body = "";

    @Override public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || ACTION_STOP.equals(intent.getAction())) {
            finish(false);
            return START_NOT_STICKY;
        }
        title = intent.getStringExtra("title");
        body = intent.getStringExtra("body");
        String sound = intent.getStringExtra("sound");
        Alarms.ensureChannels(this);
        Notification n = notification(true);
        if (Build.VERSION.SDK_INT >= 29) startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(NOTIF_ID, n);

        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        boolean phoneSilent = am != null && am.getRingerMode() != AudioManager.RINGER_MODE_NORMAL;
        if (phoneSilent || "silent".equals(sound)) { finish(true); return START_NOT_STICKY; }

        stopPlayer();
        try {
            player = new MediaPlayer();
            AudioAttributes aa = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
            player.setAudioAttributes(aa);
            player.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            setSource(player, sound);
            player.setOnCompletionListener(this);
            player.setOnErrorListener(this);
            player.prepare();
            if (am != null) {
                focus = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT).setAudioAttributes(aa).build();
                am.requestAudioFocus(focus);
            }
            player.start();
            playing = true;
        } catch (Exception e) {
            finish(true);
        }
        return START_NOT_STICKY;
    }

    private void setSource(MediaPlayer p, String sound) throws Exception {
        if ("file".equals(sound)) {
            File f = new File(getFilesDir(), "custom_adhan");
            if (f.exists() && f.length() > 0) { p.setDataSource(f.getAbsolutePath()); return; }
        }
        if ("tone".equals(sound)) {
            AssetFileDescriptor fd = getResources().openRawResourceFd(R.raw.adhan);
            p.setDataSource(fd.getFileDescriptor(), fd.getStartOffset(), fd.getLength());
            fd.close();
            return;
        }
        String asset = "adhan2".equals(sound) ? "www/audio/adhan-2.mp3" : "www/audio/adhan-1.mp3";
        AssetFileDescriptor fd = getAssets().openFd(asset);
        p.setDataSource(fd.getFileDescriptor(), fd.getStartOffset(), fd.getLength());
        fd.close();
    }

    private Notification notification(boolean withStop) {
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent openPi = PendingIntent.getActivity(this, 1, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder b = new Notification.Builder(this, Alarms.CH_ADHAN_PLAY)
            .setSmallIcon(R.drawable.ic_stat)
            .setColor(0xFF0B5A4A)
            .setContentTitle(title)
            .setContentText(body)
            .setCategory(Notification.CATEGORY_ALARM)
            .setContentIntent(openPi)
            .setOnlyAlertOnce(true)
            .setAutoCancel(true);
        if (withStop) {
            Intent stop = new Intent(this, AdhanService.class).setAction(ACTION_STOP);
            PendingIntent stopPi = PendingIntent.getService(this, 2, stop, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            b.addAction(new Notification.Action.Builder(null, "إيقاف الأذان", stopPi).build());
            b.setDeleteIntent(stopPi);
        }
        return b.build();
    }

    @Override public void onCompletion(MediaPlayer mp) { finish(true); }
    @Override public boolean onError(MediaPlayer mp, int what, int extra) { finish(true); return true; }

    private void stopPlayer() {
        if (player != null) {
            try { player.stop(); } catch (Exception ignored) { }
            player.release();
            player = null;
        }
        AudioManager am = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (am != null && focus != null) { am.abandonAudioFocusRequest(focus); focus = null; }
        playing = false;
    }

    /** Stops the sound. keepNotice leaves the prayer notification in the shade without the stop button. */
    private void finish(boolean keepNotice) {
        stopPlayer();
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (keepNotice) {
            stopForeground(Service.STOP_FOREGROUND_DETACH);
            if (nm != null) nm.notify(NOTIF_ID, notification(false));
        } else {
            stopForeground(Service.STOP_FOREGROUND_REMOVE);
            if (nm != null) nm.cancel(NOTIF_ID);
        }
        stopSelf();
    }

    @Override public void onDestroy() { stopPlayer(); super.onDestroy(); }
}
