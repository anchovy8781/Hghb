import com.android.apksig.ApkVerifier;

import java.io.File;

/** 서명된 APK 를 apksig 로 검증한다. */
public class ApkVerifyTool {
    public static void main(String[] args) throws Exception {
        ApkVerifier.Result r = new ApkVerifier.Builder(new File(args[0]))
                .setMinCheckedPlatformVersion(24)
                .build()
                .verify();
        System.out.println("verified      = " + r.isVerified());
        System.out.println("v1 scheme     = " + r.isVerifiedUsingV1Scheme());
        System.out.println("v2 scheme     = " + r.isVerifiedUsingV2Scheme());
        for (ApkVerifier.IssueWithParams e : r.getErrors()) {
            System.out.println("ERROR  " + e);
        }
        int w = 0;
        for (ApkVerifier.IssueWithParams e : r.getWarnings()) {
            if (w++ < 5) System.out.println("WARN   " + e);
        }
        if (!r.isVerified()) System.exit(1);
    }
}
