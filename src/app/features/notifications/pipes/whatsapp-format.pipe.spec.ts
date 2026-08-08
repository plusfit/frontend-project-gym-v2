import { WhatsAppFormatPipe } from "./whatsapp-format.pipe";

/**
 * Renders WhatsApp markup the way the phone will: *bold*, _italic_, ~strike~,
 * "- " bullets and line breaks. Input is escaped first — the preview binds via
 * innerHTML, so a message containing markup must never become live HTML.
 */
describe("WhatsAppFormatPipe", () => {
    const pipe = new WhatsAppFormatPipe();

    it("escapes html before formatting", () => {
        expect(pipe.transform('<img src=x onerror="x">')).toBe(
            "&lt;img src=x onerror=&quot;x&quot;&gt;",
        );
    });

    it("renders *bold* as strong", () => {
        expect(pipe.transform("gran *PLUSFIT* corre")).toBe(
            "gran <strong>PLUSFIT</strong> corre",
        );
    });

    it("renders _italic_ as em", () => {
        expect(pipe.transform("es _importante_ venir")).toBe("es <em>importante</em> venir");
    });

    it("renders ~strikethrough~ as s", () => {
        expect(pipe.transform("antes ~$1000~ ahora")).toBe("antes <s>$1000</s> ahora");
    });

    it("keeps an unpaired marker literal", () => {
        expect(pipe.transform("5 * 3 = 15")).toBe("5 * 3 = 15");
        expect(pipe.transform("nota_final")).toBe("nota_final");
    });

    it("does not span bold across line breaks", () => {
        expect(pipe.transform("*uno\ndos*")).toBe("*uno<br>dos*");
    });

    it("turns line breaks into br", () => {
        expect(pipe.transform("uno\ndos")).toBe("uno<br>dos");
    });

    it("renders - list markers as bullets", () => {
        expect(pipe.transform("- primero\n- segundo")).toBe("• primero<br>• segundo");
    });

    it("leaves a mid-line hyphen alone", () => {
        expect(pipe.transform("pre-venta abierta")).toBe("pre-venta abierta");
    });

    it("renders a full campaign", () => {
        const campaign = "*PLUSFIT A CORRER!!!*\n\n- Vamos por los _7 km_";

        expect(pipe.transform(campaign)).toBe(
            "<strong>PLUSFIT A CORRER!!!</strong><br><br>• Vamos por los <em>7 km</em>",
        );
    });

    it("returns an empty string for empty input", () => {
        expect(pipe.transform("")).toBe("");
    });
});
