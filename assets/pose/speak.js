export function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    speechSynthesis.speak(utter);
  }
  