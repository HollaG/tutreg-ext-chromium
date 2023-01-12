import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { sendMessage, validateURL } from "./functions";
import Button from "./components/Button";
import Input from "./components/Input";
import { SelectedClass } from "./types";

// https://tutreg.com/?share=CS2030S:LAB:12H,CS2030S:REC:13,CS2040S:TUT:14,CS2040S:REC:03,GEA1000:TUT:E09,HSI1000:WS:C13,HSI1000:LAB:21,MA1521:TUT:18,MA1521:TUT:11,HSI1000:LAB:02,HSI1000:WS:C02,GEA1000:TUT:D01,CS2040S:REC:04,CS2030S:REC:01,CS2030S:LAB:08A,CS2030S:LAB:08C,CS2030S:REC:03,CS2040S:REC:02,GEA1000:TUT:D02,HSI1000:WS:C01,HSI1000:LAB:01,MA1521:TUT:10,MA1521:TUT:1,HSI1000:LAB:03,HSI1000:WS:C03,CS2040S:REC:01,CS2030S:REC:04,CS2030S:LAB:08B,CS2030S:LAB:08D,CS2030S:REC:05,HSI1000:WS:C05,MA1521:TUT:12,MA1521:TUT:13,CS2030S:REC:06,CS2030S:LAB:08F,CS2030S:LAB:08G,CS2030S:REC:07,CS2030S:REC:08,CS2030S:LAB:08H,CS2030S:LAB:08E,CS2030S:REC:10,CS2030S:REC:11,CS2030S:LAB:10D,CS2030S:LAB:10C,CS2030S:REC:09
const codeMap: { [key: string]: string } = {
    WS: "Workshop",
    LAB: "Laboratory",
    LEC: "Lecture",
    TUT: "Tutorial",
    TUT2: "Tutorial Type 2",
    PLEC: "Packaged Lecture",
    PTUT: "Packaged Tutorial",
    REC: "Recitation",
};
const replacer = (str: string) => {
    if (codeMap[str]) {
        return codeMap[str];
    } else {
        return str;
    }
};

function App() {
    const [importUrl, setImportUrl] = useState("");

    const handleURLChange = (val: string) => {
        if (!validateURL(val)) {
            setError("Error: URL is not of the correct form!");
        } else {
            setError("");
        }
        setImportUrl(val);
    };

    const [error, setError] = useState("");

    const actionHandler = (action: "select" | "rank" | "expand") => {
        if (action === "expand") {
            return sendMessage({
                type: "EXPAND",

            }).then(console.log).catch(console.log)
        }

        const stripped = importUrl.replace("https://tutreg.com/order?", "")

        const params = new URLSearchParams(stripped)

        let classList: SelectedClass[] = [];
        for (const p of params) {
            if (p[0] === 'share') {
                classList = p[1].split(",").map((module) => ({
                    moduleCode: module.split(":")[0],
                    lessonType: replacer(module.split(":")[1]),
                    classNo: module.split(":")[2],
                }));
            }
        }
  

        // const importStr = importUrl.split("?share=")[1];
        // Format the data
        // sample importStr: 'HSI1000:WS:F09,HSI1000:LAB:04'
        // const moduleList = importStr.split(",").map((module) => ({
        //     moduleCode: module.split(":")[0],
        //     lessonType: replacer(module.split(":")[1]),
        //     classNo: module.split(":")[2],
        // }));

        let type: "MODULE_DATA" | "RANK_DATA" =
            action === "select" ? "MODULE_DATA" : "RANK_DATA";

        sendMessage({
            type,
            payload: classList,
        })
            .then(result => {
                if (result.error) {
                    alert(result.error)
                }
            })
            .catch(console.log);
    };

    return (
        <div className="container mx-auto  p-5">
            <div className="mb-3">
                <img
                    src="./logo512.png"
                    className="mx-auto"
                    width="180px"
                    height="180px"
                />
            </div>
            <div>
                <h1 className="mb-3 text-2xl font-semibold text-center">
                    {" "}
                    Tutreg Companion Extension{" "}
                </h1>
            </div>
            <Input
                type="text"
                value={importUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleURLChange(e.target.value)
                }
                placeholder="https://tutreg.com/?share=..."
            />
            <div className="mb-3">
                <p className="text-xs text-gray-500 text-center ">
                    Place the link you get after arranging your timetable on
                    tutreg.com here, NOT the NUSMods link.
                </p>
                {error && (
                    <p className="text-xs text-red-500 text-center ">{error}</p>
                )}
            </div>
            <div className="container p-1 flex justify-between">
                <Button onClick={() => actionHandler("expand")}>
                    {" "}
                    Expand Dialog
                </Button>

                <Button
                    onClick={() => actionHandler("select")}
                    classes="w-40"
                    moreProps={{ disabled: !!error || !importUrl }}
                >
                    {" "}
                    Auto-select{" "}
                </Button>
                <Button
                    onClick={() => actionHandler("rank")}
                    classes="w-40"
                    moreProps={{ disabled: !!error || !importUrl }}
                >
                    {" "}
                    Auto-rank{" "}
                </Button>
            </div>
            <div className="text-center">
                <a
                    href="https://tutreg.com/extension#usage"
                    target="_blank"
                    className="text-xs text-gray-500 text-center underline"
                >
                    {" "}
                    How to use?{" "}
                </a>
            </div>
        </div>
    );
}

export default App;
