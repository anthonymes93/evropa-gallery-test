/* Independent contact form. Uses /api/contact on Vercel; no WordPress AJAX. */
(() => {
  function init() {
    const form = document.getElementById("wpforms-form-7");
    if (!form) return;
    form.classList.remove("wpforms-ajax-form");
    const button = form.querySelector('[type="submit"]');
    const status = document.createElement("div");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.cssText = "margin-top:12px;font:15px/1.5 system-ui,sans-serif;color:inherit";
    button.parentElement.appendChild(status);
    const trap = document.createElement("input");
    trap.type = "text"; trap.name = "company_website"; trap.tabIndex = -1;
    trap.autocomplete = "off"; trap.setAttribute("aria-hidden", "true");
    trap.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px";
    form.appendChild(trap);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;
      const value = id => (document.getElementById(id)?.value || "").trim();
      const data = {
        name: value("wpforms-7-field_0"),
        email: value("wpforms-7-field_1"),
        subject: value("wpforms-7-field_3"),
        message: value("wpforms-7-field_2"),
        company_website: trap.value
      };
      button.disabled = true;
      status.textContent = "Sending your message...";
      try {
        const response = await fetch("/api/contact", {
          method: "POST", headers: {"Content-Type": "application/json"},
          body: JSON.stringify(data)
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result.ok) {
          status.textContent = "Thank you. Your message has been sent.";
          form.reset();
          return;
        }
      } catch (error) { /* Show the usable email fallback below. */ }
      status.textContent = "Automatic sending is unavailable. You can send your message through your email app instead: ";
      const link = document.createElement("a");
      link.textContent = "Compose email";
      const subject = data.subject || "Website enquiry";
      const body = "Name: " + data.name + "\nEmail: " + data.email + "\n\n" + data.message;
      link.href = "mailto:Evropaflooring@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.appendChild(link);
      button.disabled = false;
    }, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
