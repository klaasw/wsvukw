'use strict';

const tools = {
	// Zahlen vergleichen: Dient als Funktion für Array.sort() da sort nur alphabetisch sortiert
	vergleicheZahlen(a, b) {
		return a - b;
	},

	// Doppeleinträge aus Array entfernen.
	entferneDoppel(array) {
		return array.filter(function (item, position, self) {
			return self.indexOf(item) == position;
		});
	}
};

module.exports = tools;