import { handleChromeError, sendMessage, sleep } from "../functions";
import { DOMMessage, DOMMessageResponse, SelectedClass } from "../types";

// Function called when a new message is received
const messagesFromReactAppListener = (
    msg: DOMMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: DOMMessageResponse) => void
) => {
    // console.log("[content.js]. Message received", msg);
    if (chrome.runtime.lastError) {
        handleChromeError(chrome.runtime.lastError);
    } else {
        switch (msg.type) {
            case "MODULE_DATA": {
                let data = msg.payload as SelectedClass[];

                const resultContainer = msg.payload?.map(
                    (class_: SelectedClass) => ({ ...class_ })
                );

                // const modulesContainer =
                //     document.querySelector(".ps_box-scrollarea");
                const modulesContainerOptions: (
                    | HTMLElement
                    | null
                    | undefined
                )[] = [];
                document.querySelectorAll("iframe").forEach((item) => {
                    const option =
                        item?.contentWindow?.document.body.querySelector(
                            ".ps_box-scrollarea"
                        ) as HTMLElement;
                    modulesContainerOptions.push(option);
                });
                const modulesContainer = modulesContainerOptions.find(
                    (item) => item !== null
                );
                if (!modulesContainer) {
                    return sendResponse({
                        error: "Select Classes dialog not found. Is it open?",
                    });
                }

                let children = modulesContainer.children;

                if (!children || children.length === 0) {
                    return sendResponse({
                        error: "Select Classes dialog not found. Is it open?",
                    });
                }

                for (let i = 0; i < children.length; i++) {
                    const module = children[i];

                    const moduleName = module.querySelector("h2")?.innerText;

                    // todo : error handling
                    if (!moduleName) {
                        // console.log("no module name found");
                        continue;
                    }
                    console.log(`Checking ${moduleName}`);

                    const classesContainer = module.querySelector("tbody");
                    if (!classesContainer) {
                        // console.log("no classescontainer");
                        continue;
                    }

                    const classes = classesContainer.children;

                    // index:
                    // 0: classNo
                    // 1: lessonType
                    // 2: Session (ignore)
                    // 3: Vacancy (ignore)
                    // 4: checkbox

                    const results = [];

                    for (let j = 0; j < classes.length; j++) {
                        const class_ = classes[j];

                        // see: https://bobbyhadz.com/blog/typescript-property-innertext-not-exist-type-element
                        const classNoContainer = class_
                            .children[0] as HTMLElement;
                        const classNo = classNoContainer.innerText;

                        const lessonTypeContainer = class_
                            .children[1] as HTMLElement;
                        const lessonTypeContainerNested =
                            lessonTypeContainer.querySelector(
                                ".ps_box-value"
                            ) as HTMLElement;
                        const lessonType = lessonTypeContainerNested.innerText;

                        // Check if this row's moduleCode matches, lessonType matches, and classNo is a subset
                        const match = data.find((class_) => {
                            return (
                                moduleName.includes(class_.moduleCode) &&
                                class_.lessonType === lessonType &&
                                classNo.includes(class_.classNo)
                            );
                        });

                        if (match) {
                            // great, tick the checkbox
                            console.log(
                                `Found a match for ${moduleName} ${lessonType} ${classNo}`
                            );

                            const checkbox = class_.children[4].querySelector(
                                "input[type='checkbox']"
                            ) as HTMLInputElement;

                            // click only if it's not already checked
                            if (!checkbox.checked) {
                                checkbox.click();
                            }

                            // remove from data so we know it's already done
                            data = data.filter(
                                (class_) =>
                                    !moduleName.includes(class_.moduleCode) ||
                                    class_.lessonType !== lessonType ||
                                    !classNo.includes(class_.classNo)
                            );
                        } else {
                            // do nothing
                            // console.log(
                            //     `Did not find a match for moduleName: ${moduleName}  lessonType:${lessonType} classNo:${classNo}`
                            // );
                        }
                    }
                }
                if (data.length) {
                    sendResponse({
                        error: `${
                            data.length
                        } classes could not be found: ${data
                            .map(
                                (item) =>
                                    `${item.moduleCode} ${item.lessonType} ${item.classNo}`
                            )
                            .join(", ")}`,
                    });
                }
                sendResponse({
                    payload: { data },
                });
                break;
            }
            case "RANK_DATA": {
                const data = msg.payload as SelectedClass[];
                // const modulesContainer =
                //     document.querySelector(".ps_box-scrollarea");
                const modulesContainerOptions: (
                    | HTMLElement
                    | null
                    | undefined
                )[] = [];
                document.querySelectorAll("iframe").forEach((item) => {
                    const option =
                        item?.contentWindow?.document.body.querySelector(
                            "table.ps_grid-flex"
                        ) as HTMLElement;
                    modulesContainerOptions.push(option);
                });
                const classesContainer = modulesContainerOptions.find(
                    (item) => item !== null
                );
                if (!classesContainer) {
                    sendResponse({
                        error: "Rank Classes dialog not found. Is it open?",
                    });
                    return;
                }

                const tableBody = classesContainer.querySelector(
                    "tbody"
                ) as HTMLElement;

                const children = tableBody.children;

                // index:
                // 0: classNo
                // 1: module activity [CS2030S Laboratory]
                // 2: Session (ignore)
                // 3: Vacancy (ignore)
                // 4: rank select

                // for (let i = 0; i < children.length; i++) {
                //     const class_ = children[i];

                //     const classNoContainer = class_.children[0] as HTMLElement;
                //     const classNo = classNoContainer.innerText;

                //     const moduleActivityContainer = class_
                //         .children[1] as HTMLElement;
                //     const moduleActivity = moduleActivityContainer.innerText;
                //     const moduleActivityArr = moduleActivity.split(" ");
                //     const moduleCode = moduleActivityArr.shift();
                //     const lessonType = moduleActivityArr.join(" ");

                //     // look for the index of this in data
                //     const index = data.findIndex((item) => {
                //         return (
                //             moduleCode === item.moduleCode &&
                //             item.lessonType === lessonType &&
                //             classNo.includes(item.classNo)
                //         );
                //     });
                //     if (index === -1) {
                //         console.log(
                //             `Couldn't find one for ${moduleCode} ${lessonType} ${classNo}!`
                //         );
                //     } else {
                //         // set the dropdown menu to index+1

                //         const select = class_.children[4].querySelector(
                //             "select"
                //         ) as HTMLSelectElement;

                //         select.value = (index + 1).toString();
                //         select.dispatchEvent(new Event("change"));

                //         result = result.filter(
                //             (item) =>
                //                 moduleCode !== item.moduleCode ||
                //                 item.lessonType !== lessonType ||
                //                 !classNo.includes(item.classNo)
                //         );
                //     }
                // }

                // result = await ranker(children, data);
                console.log({ tries: msg.tries });
                ranker(children, data).then((result) => {
                    console.log({ result });
                    if (result.length) {
                        // sendResponse({
                        //     error: `Please click the 'Auto-rank' button again. This is required due to the way NUS has coded their website.\nSorry for the inconvience. If this message persists, contact the developer at https://t.me/+sbR6NJfo7axkNWE1.`
                        // })
                        console.log("trying again!!!");
                        if (msg.tries && msg.tries === 1) {
                            // second try already, give up
                            sendResponse({
                                error: `${
                                    result.length
                                } classes could not be ranked: ${result
                                    .map(
                                        (item) =>
                                            `${item.moduleCode} ${item.lessonType} ${item.classNo}`
                                    )
                                    .join(", ")}.`,
                            });
                        } else {
                            sendResponse({
                                payload: {
                                    ranker: "try_again",
                                    tries: 1,
                                },
                            });
                        }
                    } else {
                        sendResponse({
                            payload: { text: "Successfully ranked." },
                        });
                    }
                });

                // const result = ranker(children, data);

                // because of how nus does this, we need to try this again.
                // Possible need to try again. Only if tries < 2
                // if (!msg.tries || msg.tries < 2) {
                //     console.log("trying again");
                //     sendResponse({
                //         payload: {
                //             ranker: "try_again",
                //             tries: msg.tries ? msg.tries + 1 : 1,
                //         },
                //     });
                // } else {
                //     // error!
                //     if (result.length) {
                //         sendResponse({
                //             error: `${
                //                 result.length
                //             } classes could not be ranked: ${result
                //                 .map(
                //                     (item) =>
                //                         `${item.moduleCode} ${item.lessonType} ${item.classNo}`
                //                 )
                //                 .join(", ")}.`,
                //         });
                //     } else {
                //         sendResponse({
                //             payload: { text: "Successfully ranked." },
                //         });
                //     }
                // }

                return true; // Indicate async. See: https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await

                // if (result.length) {
                //     // error, couldn't rank a class

                //     // try one more time.
                //     result = await ranker(children, data);
                //     console.log({result})
                //     if (result.length) {
                //         sendResponse({
                //             error: `${
                //                 result.length
                //             } classes could not be ranked: ${result
                //                 .map(
                //                     (item) =>
                //                         `${item.moduleCode} ${item.lessonType} ${item.classNo}`
                //                 )
                //                 .join(", ")}.`,
                //         });
                //     }
                // }

                break;
            }

            case "EXPAND": {
                const iframes = document.querySelectorAll("iframe");
                if (!iframes || !iframes.length) {
                    sendResponse({
                        error: "Couldn't find a popup! Did you open the popup?",
                    });

                    return;
                }

                iframes.forEach((iframe) => {
                    iframe.removeAttribute("height");
                    iframe.removeAttribute("style");
                    iframe.style.height = "100vh";
                });

                const dialogs: NodeListOf<HTMLElement> =
                    document.querySelectorAll("div[role='dialog']");
                if (!dialogs || !dialogs.length) {
                    sendResponse({
                        error: "Couldn't find a popup! Did you open the popup?",
                    });

                    return;
                }

                dialogs.forEach((dialog) => {
                    dialog.style.top = "0px";
                });

                sendResponse({ payload: { text: "Hello from content.js" } });
                break;
            }
        }
    }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime &&
    chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

async function ranker(children: HTMLCollection, data: SelectedClass[]) {
    console.log("ranker called");
    let result = data.map((class_) => ({ ...class_ }));
    for (let i = 0; i < children.length; i++) {
        // console.log("-------------------------------------")
        const class_ = children[i];

        const classNoContainer = class_.children[0] as HTMLElement;
        const classNo = classNoContainer.innerText;

        const moduleActivityContainer = class_.children[1] as HTMLElement;
        const moduleActivity = moduleActivityContainer.innerText;
        const moduleActivityArr = moduleActivity.split(" ");
        const moduleCode = moduleActivityArr.shift();
        const lessonType = moduleActivityArr.join(" ");

        // look for the index of this in data
        // console.log({data})
        const index = data.findIndex((item) => {
            return (
                moduleCode === item.moduleCode &&
                item.lessonType === lessonType &&
                classNo.includes(item.classNo)
            );
        });
        // console.log("index", index)
        const select = class_.children[4].querySelector(
            "select"
        ) as HTMLSelectElement;

        // console.log(select)
        if (index === -1) {
            console.log(
                `Couldn't find one for ${moduleCode} ${lessonType} ${classNo}!`
            );
        } else {
            // set the dropdown menu to index+1

            select.value = (index + 1).toString();
            select.dispatchEvent(new Event("change"));
            await sleep(10);
            result = result.filter(
                (item) =>
                    moduleCode !== item.moduleCode ||
                    item.lessonType !== lessonType ||
                    !classNo.includes(item.classNo)
            );
        }
    }

    return result;
}

// function ranker(children: HTMLCollection, data: SelectedClass[]) {
//     console.log("ranker called");
//     let result = data.map((class_) => ({ ...class_ }));
//     for (let i = 0; i < children.length; i++) {
//         console.log("-------------------------------------");
//         const class_ = children[i];

//         const classNoContainer = class_.children[0] as HTMLElement;
//         const classNo = classNoContainer.innerText;

//         const moduleActivityContainer = class_.children[1] as HTMLElement;
//         const moduleActivity = moduleActivityContainer.innerText;
//         const moduleActivityArr = moduleActivity.split(" ");
//         const moduleCode = moduleActivityArr.shift();
//         const lessonType = moduleActivityArr.join(" ");

//         // look for the index of this in data
//         // console.log({ data });
//         const index = data.findIndex((item) => {
//             return (
//                 moduleCode === item.moduleCode &&
//                 item.lessonType === lessonType &&
//                 classNo.includes(item.classNo)
//             );
//         });
//         // console.log("index", index);
//         const select = class_.children[4].querySelector(
//             "select"
//         ) as HTMLSelectElement;

//         // console.log(select);
//         if (index === -1) {
//             console.log(
//                 `Couldn't find one for ${moduleCode} ${lessonType} ${classNo}!`
//             );
//         } else {
//             // set the dropdown menu to index+1

//             select.value = (index + 1).toString();
//             select.dispatchEvent(new Event("change"));
//             // await sleep(10);
//             result = result.filter(
//                 (item) =>
//                     moduleCode !== item.moduleCode ||
//                     item.lessonType !== lessonType ||
//                     !classNo.includes(item.classNo)
//             );
//         }
//     }

//     return result;
// }
