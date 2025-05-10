import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: 'prueba-mcp',
    version: '1.0.0',
})

//Herramientas 

server.tool(
    'fetch-weather',
    'A tool to fetch the weather city',
    {
        city: z.string().describe('City name')
    },
    async ({ city }) => {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`)
        const data = await response.json()
        if (data.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `No se encontro informacion para la ciudad ${city}`,
                    }
                ]
            }
        }
        const { latitude, longitude } = data.results[0]
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,is_day,precipitation,rain`)
        const weatherData = await weatherResponse.json()

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(weatherData, null, 2),
                }
            ]
        }


    }
)
//Escuchar peticiones  
const transport = new StdioServerTransport()
await server.connect(transport)

