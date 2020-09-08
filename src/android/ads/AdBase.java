package admob.plugin.ads;

import android.util.SparseArray;

import org.json.JSONException;
import org.json.JSONObject;

import admob.plugin.AdMob;


public abstract class AdBase {
    protected static AdMob plugin;

    final int id;
    String adUnitID;

    private static SparseArray<AdBase> ads = new SparseArray<AdBase>();


    AdBase(int id, String adUnitID) {
        this.id = id;
        this.adUnitID = adUnitID;

        ads.put(id, this);
    }

    public static void initialize(AdMob plugin) {
        AdBase.plugin = plugin;
    }

    public static AdBase getAd(Integer id) {
        return ads.get(id);
    }

    JSONObject buildErrorPayload(int errorCode) {
        JSONObject data = new JSONObject();
        try {
            data.put("errorCode", errorCode);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return data;
    }

    public void destroy() {
        ads.remove(id);
    }

    abstract String getLoadedEvent();
    abstract String getFailedToLoadEvent();
    abstract String getOpenedEvent();
    abstract String getClosedEvent();
    abstract String getLeftApplicationEvent();
    String getImpressionEvent() { return null; }
    String getClickedEvent() { return null; }
}
