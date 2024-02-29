import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import "@fontsource/roboto"

import { createTheme } from "@mui/material/styles"
import { ThemeProvider } from "@mui/material"

export const theme = createTheme({
    typography: {
        fontFamily: ["Roboto", "sans-serif"].join(","),
        button: {
            fontSize: 16,
            fontWeight: 400
        }
    }
})

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>
)
