import { NAME_TOKEN, insertToken, interpolateName } from "./message-template";

/**
 * The {nombre} contract, mirrored from the gym backend's interpolateName: the
 * preview and the test send must produce byte-for-byte what the backend will
 * ship, or the preview is a lie.
 */
describe("message-template", () => {
    describe("interpolateName", () => {
        it("replaces every token with the name", () => {
            expect(interpolateName("Hola {nombre}, {nombre}!", "Ana")).toBe("Hola Ana, Ana!");
        });

        it("returns the template untouched when there is no token", () => {
            expect(interpolateName("Hola a todos", "Ana")).toBe("Hola a todos");
        });

        /** split/join semantics: a "$&" in a name must stay literal. */
        it("keeps dollar patterns in names literal", () => {
            expect(interpolateName("Hola {nombre}", "Ana $& Cia")).toBe("Hola Ana $& Cia");
        });
    });

    describe("insertToken", () => {
        it("inserts the token at the cursor position", () => {
            const result = insertToken("Hola !", NAME_TOKEN, 5, 5);

            expect(result.text).toBe("Hola {nombre}!");
            expect(result.cursor).toBe(13);
        });

        it("replaces the selected range", () => {
            const result = insertToken("Hola AAAA!", NAME_TOKEN, 5, 9);

            expect(result.text).toBe("Hola {nombre}!");
        });

        it("appends when the position is at the end", () => {
            const result = insertToken("Hola ", NAME_TOKEN, 5, 5);

            expect(result.text).toBe("Hola {nombre}");
        });
    });
});
