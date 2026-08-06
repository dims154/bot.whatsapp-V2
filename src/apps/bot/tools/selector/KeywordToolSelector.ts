export class KeywordToolSelector {

    select(prompt: string): string | null {

        const text = prompt.toLowerCase();

        if (text.includes("jam")) {
            return "time";
        }

        if (text.includes("waktu")) {
            return "time";
        }

        return null;
    }

}