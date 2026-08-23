import com.android.apksig.ApkSigner;

import java.io.File;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** apksig 라이브러리로 APK 에 v1 + v2 서명을 넣는 최소 도구. */
public class ApkSignTool {
    public static void main(String[] args) throws Exception {
        if (args.length < 5) {
            System.err.println("usage: ApkSignTool <in.apk> <out.apk> <keystore> <pass> <alias>");
            System.exit(2);
        }
        File in = new File(args[0]);
        File out = new File(args[1]);
        char[] pass = args[3].toCharArray();

        KeyStore ks = KeyStore.getInstance("PKCS12");
        try (FileInputStream fis = new FileInputStream(args[2])) {
            ks.load(fis, pass);
        }
        PrivateKey key = (PrivateKey) ks.getKey(args[4], pass);
        List<X509Certificate> certs = new ArrayList<X509Certificate>();
        for (java.security.cert.Certificate c : ks.getCertificateChain(args[4])) {
            certs.add((X509Certificate) c);
        }

        ApkSigner.SignerConfig cfg =
                new ApkSigner.SignerConfig.Builder("busan2033", key, certs).build();

        if (out.exists()) {
            out.delete();
        }
        new ApkSigner.Builder(Collections.singletonList(cfg))
                .setInputApk(in)
                .setOutputApk(out)
                .setMinSdkVersion(24)
                .setV1SigningEnabled(false)  // JDK 내부 PKCS7 API 의존 문제로 v1 미사용 (minSdk 24)
                .setV2SigningEnabled(true)
                .setCreatedBy("busan2033-build")
                .build()
                .sign();
        System.out.println("   서명 완료: " + out.getPath());
    }
}
