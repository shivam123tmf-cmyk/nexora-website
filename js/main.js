(function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Contact form: build mailto + optional WhatsApp draft
  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (form.querySelector("[name=name]") || {}).value || "";
    var email = (form.querySelector("[name=email]") || {}).value || "";
    var business = (form.querySelector("[name=business]") || {}).value || "";
    var interest = (form.querySelector("[name=interest]") || {}).value || "";
    var message = (form.querySelector("[name=message]") || {}).value || "";

    var subject = encodeURIComponent("Nexora enquiry — " + (interest || "General"));
    var body = encodeURIComponent(
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Business: " + business + "\n" +
      "Interest: " + interest + "\n\n" +
      message
    );
    window.location.href = "mailto:shivam123tmf@gmail.com?subject=" + subject + "&body=" + body;
  });

  var waBtn = document.getElementById("whatsapp-send");
  if (waBtn) {
    waBtn.addEventListener("click", function () {
      var name = (form.querySelector("[name=name]") || {}).value || "";
      var business = (form.querySelector("[name=business]") || {}).value || "";
      var interest = (form.querySelector("[name=interest]") || {}).value || "";
      var message = (form.querySelector("[name=message]") || {}).value || "";
      var text = encodeURIComponent(
        "Hi Shivam, I'm " + (name || "interested") +
        (business ? " from " + business : "") +
        ". Looking at: " + (interest || "Nexora AI services") + ".\n\n" +
        (message || "I'd like a quick chat about automation for my business.")
      );
      window.open("https://wa.me/919205089044?text=" + text, "_blank", "noopener");
    });
  }
})();
