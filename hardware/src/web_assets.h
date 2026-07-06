#pragma once
// ──────────────────────────────────────────────────────────
// Embedded web assets
//
// These symbols are generated automatically by PlatformIO from
// board_build.embed_txtfiles in platformio.ini. Each file under
// web/ becomes a pair of extern arrays: <name>_start / <name>_end.
// Nothing here needs to change when the HTML/CSS/JS content
// changes - only when you ADD or REMOVE a file from the list in
// platformio.ini.
// ──────────────────────────────────────────────────────────

#include <WebServer.h>
#include <string.h>

extern const uint8_t index_html_start[]  asm("_binary_web_index_html_start");
extern const uint8_t index_html_end[]    asm("_binary_web_index_html_end");

extern const uint8_t enroll_html_start[] asm("_binary_web_enroll_html_start");
extern const uint8_t enroll_html_end[]   asm("_binary_web_enroll_html_end");

extern const uint8_t auth_html_start[]   asm("_binary_web_auth_html_start");
extern const uint8_t auth_html_end[]     asm("_binary_web_auth_html_end");

extern const uint8_t style_css_start[]   asm("_binary_web_style_css_start");
extern const uint8_t style_css_end[]     asm("_binary_web_style_css_end");

extern const uint8_t app_js_start[]      asm("_binary_web_app_js_start");
extern const uint8_t app_js_end[]        asm("_binary_web_app_js_end");

// Serves one embedded asset.
//
// NOTE: PlatformIO's embed_txtfiles appends a trailing '\0' after the
// file content, and the "_end" symbol points PAST that null byte.
// Using (end - start) as the length therefore sends one extra null
// byte at the end of every response. That's harmless inside HTML/CSS,
// but a stray NUL at the end of app.js is an invalid token and makes
// the ENTIRE script fail to parse - which silently kills every
// addEventListener-driven button on every page. Using strlen() instead
// gives the true content length and avoids that trap.
inline void serveEmbedded(WebServer &srv, const uint8_t *start, const uint8_t * /*end*/, const char *mime) {
  size_t len = strlen(reinterpret_cast<const char *>(start));
  srv.send_P(200, mime, reinterpret_cast<const char *>(start), len);
}