import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SSDM ARTIFICIAL INTELLIGENCE | Kepolisian Negara Republik Indonesia",
  description: "Sistem Informasi Personel & Kecerdasan Buatan SSDM POLRI Presisi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased font-sans dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked') return;
                    return origSetAttr.apply(this, arguments);
                  };
                  if (typeof MutationObserver !== 'undefined') {
                    const observer = new MutationObserver(function(mutations) {
                      for (let i = 0; i < mutations.length; i++) {
                        const m = mutations[i];
                        if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                          m.target.removeAttribute('bis_skin_checked');
                        }
                      }
                    });
                    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
                  }

                  // Pengalihan Instan Keycloak SSO di Head (Zero-Flicker / Bebas Sisa Tampilan)
                  var sess = sessionStorage.getItem('infopers_token');
                  var hash = window.location.hash || '';
                  var search = window.location.search || '';
                  var isLocal = search.indexOf('mode=') !== -1;
                  var hasOidc = hash.indexOf('access_token') !== -1 || search.indexOf('code=') !== -1;

                  if (!sess && !hasOidc && !isLocal) {
                    var redir = encodeURIComponent(window.location.origin + '/');
                    var ssoUrl = 'http://localhost:8080/realms/ssdm-polri/protocol/openid-connect/auth?client_id=infopers-frontend&response_type=token%20id_token&scope=openid%20profile%20email&redirect_uri=' + redir + '&nonce=' + Date.now() + '&prompt=login';
                    window.location.replace(ssoUrl);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
