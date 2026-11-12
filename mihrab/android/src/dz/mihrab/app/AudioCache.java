package dz.mihrab.app;

import android.content.Context;
import android.webkit.WebResourceResponse;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

/** Serves recitation files to the page from a disk cache, fetching them from the CDN the first time. */
final class AudioCache {
    private static final String CDN = "https://cdn.islamic.network/quran/audio/";
    private static final long MAX_BYTES = 300L * 1024 * 1024;
    private static int stores = 0;

    static WebResourceResponse serve(Context c, String rel) {
        if (!rel.matches("\\d{2,3}/[a-z.]{3,40}/\\d{1,4}\\.mp3")) return notFound();
        File dir = new File(c.getCacheDir(), "audio");
        if (!dir.exists()) dir.mkdirs();
        File f = new File(dir, rel.replace('/', '_'));
        try {
            if (!f.exists() || f.length() == 0) {
                if (!download(rel, f)) return notFound();
                if (++stores % 40 == 0) trim(dir);
            }
            f.setLastModified(System.currentTimeMillis());
            WebResourceResponse r = new WebResourceResponse("audio/mpeg", null, new FileInputStream(f));
            Map<String, String> h = new HashMap<>();
            h.put("Access-Control-Allow-Origin", "*");
            h.put("Cache-Control", "max-age=31536000");
            h.put("Content-Length", String.valueOf(f.length()));
            r.setResponseHeaders(h);
            return r;
        } catch (Exception e) {
            return notFound();
        }
    }

    private static boolean download(String rel, File f) {
        File tmp = new File(f.getPath() + ".part");
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(CDN + rel).openConnection();
            c.setRequestProperty("User-Agent", "Mihrab/1.5 (Android prayer times app)");
            c.setConnectTimeout(15000); c.setReadTimeout(30000);
            if (c.getResponseCode() != 200) return false;
            try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(tmp)) {
                byte[] b = new byte[16384]; int n;
                while ((n = in.read(b)) > 0) out.write(b, 0, n);
            }
            return tmp.length() > 0 && tmp.renameTo(f);
        } catch (Exception e) {
            tmp.delete();
            return false;
        }
    }

    private static void trim(File dir) {
        File[] files = dir.listFiles();
        if (files == null) return;
        long total = 0;
        for (File x : files) total += x.length();
        if (total <= MAX_BYTES) return;
        Arrays.sort(files, Comparator.comparingLong(File::lastModified));
        for (File x : files) { if (total <= MAX_BYTES * 0.8) break; total -= x.length(); x.delete(); }
    }

    private static WebResourceResponse notFound() {
        return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, new ByteArrayInputStream(new byte[0]));
    }
}
