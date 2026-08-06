import { Tool } from "../Tool";
import { ToolContext } from "../ToolContext";
import { ToolResult } from "../ToolResult";

export class TimeTool implements Tool {

readonly definition = {

    name: "time",

    description: "Mengambil waktu saat ini.",

    parameters: []

};

    async execute(
        _context: ToolContext
    ): Promise<ToolResult> {

        return {

            success: true,

            result: new Date().toLocaleString(
                "id-ID",
                {
                    timeZone: "Asia/Jakarta"
                }
            )

        };

    }

}