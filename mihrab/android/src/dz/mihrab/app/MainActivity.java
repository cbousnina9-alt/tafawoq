package dz.mihrab.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import android.util.Base64;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static volatile boolean visible = false;
    private static final int REQ_LOCATION = 1;
    private static final int REQ_NOTIFY = 2;

    private WebView web;
    private Compass compass;
    private GeolocationPermissions.Callback geoCallback;
    private String geoOrigin;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setGeolocationEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setTextZoom(100);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (!HOST.equals(u.getHost())) return null;
                String path = u.getPath();
                if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
                try {
                    InputStream in = getAssets().open("www" + path);
                    WebResourceResponse r = new WebResourceResponse(mime(path), null, in);
                    Map<String, String> h = new HashMap<>();
                    h.put("Cache-Control", "no-cache");
                    h.put("Access-Control-Allow-Origin", "*");
                    r.setResponseHeaders(h);
                    return r;
                } catch (Exception e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null, null);
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (hasLocation()) { callback.invoke(origin, true, false); return; }
                geoCallback = callback; geoOrigin = origin;
                requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOCATION);
            }
        });

        compass = new Compass(this, web);
        web.addJavascriptInterface(new Bridge(), "MihrabNative");

        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFY);
        }

        String page = pageFrom(getIntent());
        if (state != null && page == null) web.restoreState(state);
        else web.loadUrl("https://" + HOST + "/index.html#" + (page != null ? "dhikr-" + page : "home"));
    }

    /** Page a notification asked to open (letters and digits only). */
    static String pageFrom(Intent i) {
        String p = i == null ? null : i.getStringExtra("open");
        return p != null && p.matches("[a-z0-9]{1,16}") ? p : null;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String page = pageFrom(intent);
        if (page != null) web.evaluateJavascript("window.__mihrabOpen&&window.__mihrabOpen('" + page + "')", null);
    }

    private boolean hasLocation() {
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        if (code == REQ_LOCATION && geoCallback != null) {
            geoCallback.invoke(geoOrigin, hasLocation(), false);
            geoCallback = null;
        }
    }

    static String mime(String p) {
        p = p.toLowerCase();
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    @Override protected void onResume() { super.onResume(); visible = true; web.onResume(); compass.resume(); }
    @Override protected void onPause() { visible = false; compass.pause(); web.onPause(); super.onPause(); }
    @Override protected void onDestroy() { compass.stop(); super.onDestroy(); }
    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    class Bridge {
        @JavascriptInterface
        public void schedule(String json) {
            Alarms.save(MainActivity.this, json);
            Alarms.scheduleNext(MainActivity.this);
        }

        @JavascriptInterface
        public void setWidget(String json) { PrayerWidget.save(MainActivity.this, json); }

        /** Status and navigation bars follow the page's light or dark theme. */
        @JavascriptInterface
        public void setBars(final boolean dark) {
            runOnUiThread(() -> {
                int color = dark ? 0xFF0A1411 : 0xFFF7F4EC;
                getWindow().setStatusBarColor(color);
                getWindow().setNavigationBarColor(color);
                int flags = dark ? 0 : (android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
                getWindow().getDecorView().setSystemUiVisibility(flags);
            });
        }

        @JavascriptInterface
        public void stopAdhan() {
            if (!AdhanService.playing) return;
            try { startService(new Intent(MainActivity.this, AdhanService.class).setAction(AdhanService.ACTION_STOP)); } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public boolean startCompass(double lat, double lng) {
            return compass.start(lat, lng);
        }

        @JavascriptInterface
        public void stopCompass() { compass.stop(); }

        @JavascriptInterface
        public boolean saveSound(String base64) {
            try (FileOutputStream out = new FileOutputStream(new File(getFilesDir(), "custom_adhan"))) {
                out.write(Base64.decode(base64, Base64.DEFAULT));
                return true;
            } catch (Exception e) { return false; }
        }

        /** Place-name lookup; only OpenStreetMap's reverse geocoder is reachable from here. */
        @JavascriptInterface
        public void httpGet(final String id, final String url) {
            new Thread(() -> {
                boolean ok = false; String body;
                try {
                    Uri u = Uri.parse(url);
                    if (!"https".equals(u.getScheme()) || !"nominatim.openstreetmap.org".equals(u.getHost())) throw new Exception("host not allowed");
                    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                    c.setRequestProperty("User-Agent", "Mihrab/1.1 (Android prayer times app)");
                    c.setConnectTimeout(10000); c.setReadTimeout(10000);
                    int code = c.getResponseCode();
                    InputStream in = code < 400 ? c.getInputStream() : c.getErrorStream();
                    ByteArrayOutputStream buf = new ByteArrayOutputStream();
                    byte[] b = new byte[8192]; int n;
                    while (in != null && (n = in.read(b)) > 0) buf.write(b, 0, n);
                    body = buf.toString("UTF-8");
                    ok = code == 200;
                } catch (Exception e) { body = String.valueOf(e.getMessage()); }
                final String js = "window.__mihrabResolve&&window.__mihrabResolve(" + JSONObject.quote(id) + "," + ok + "," + JSONObject.quote(body) + ")";
                web.post(() -> web.evaluateJavascript(js, null));
            }).start();
        }
    }
}
