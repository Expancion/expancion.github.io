document.addEventListener("DOMContentLoaded", () => {
    new TypeIt("#hero-typing", {
      speed: 75,
      deleteSpeed: 40,
      loop: true,
      waitUntilVisible: true,
    })
      .type("Vítej na mém webu!")
      .pause(3000)
      .delete()
      .type("Pracuji s Azure, Intune a Entra ID.")
      .pause(3000)
      .delete()
      .type("Automatizuji pomocí Terraformu a Ansible.")
      .pause(3000)
      .delete()
      .type("A taky si hraju s Godot enginem 😄")
      .pause(3000)
      .delete()
      .go();
  });
