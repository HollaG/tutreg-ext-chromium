import { handleChromeError } from "../functions";
import { DOMMessage, DOMMessageResponse, SelectedClass } from "../types";

// Function called when a new message is received
const messagesFromReactAppListener = (
    msg: DOMMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: DOMMessageResponse) => void
) => {
    console.log("[content.js]. Message received", msg);
    if (chrome.runtime.lastError) {
        console.log("last error");
        handleChromeError(chrome.runtime.lastError);
    } else {
        switch (msg.type) {
            case "MODULE_DATA": {
                console.log(msg.payload);

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
                            ".ps_box-scrollarea"
                        ) as HTMLElement;
                    modulesContainerOptions.push(option);
                });
                const modulesContainer = modulesContainerOptions.find(
                    (item) => item !== null
                );
                if (!modulesContainer) {
                    return console.log("no scrollarea");
                }

                let children = modulesContainer.children;

                if (!children || children.length === 0) {
                    return console.log("no children");
                }
                console.log(children);
                for (let i = 0; i < children.length; i++) {
                    const module = children[i];

                    const moduleName = module.querySelector("h2")?.innerText;

                    // todo : error handling
                    if (!moduleName) {
                        console.log("no module name found");
                        continue;
                    }
                    console.log(`Checking ${moduleName}`);

                    const classesContainer = module.querySelector("tbody");
                    if (!classesContainer) {
                        console.log("no classescontainer");
                        continue;
                    }

                    const classes = classesContainer.children;

                    // index:
                    // 0: classNo
                    // 1: lessonType
                    // 2: Session (ignore)
                    // 3: Vacancy (ignore)
                    // 4: checkbox

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
                        } else {
                            // do nothing
                            // console.log(
                            //     `Did not find a match for moduleName: ${moduleName}  lessonType:${lessonType} classNo:${classNo}`
                            // );
                        }
                    }
                }
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
                    return console.log("no table");
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
                for (let i = 0; i < children.length; i++) {
                    const class_ = children[i];

                    const classNoContainer = class_.children[0] as HTMLElement;
                    const classNo = classNoContainer.innerText;

                    const moduleActivityContainer = class_
                        .children[1] as HTMLElement;
                    const moduleActivity = moduleActivityContainer.innerText;
                    const moduleActivityArr = moduleActivity.split(" ");
                    const moduleCode = moduleActivityArr.shift();
                    const lessonType = moduleActivityArr.join(" ");

                    // look for the index of this in data
                    const index = data.findIndex((item) => {
                        return (
                            moduleCode === item.moduleCode &&
                            item.lessonType === lessonType &&
                            classNo.includes(item.classNo)
                        );
                    });
                    if (index === -1) {
                        console.log(
                            `Couldn't find one for ${moduleCode} ${lessonType} ${classNo}!`
                        );
                    } else {
                        // set the dropdown menu to index+1

                        const select = class_.children[4].querySelector(
                            "select"
                        ) as HTMLSelectElement;

                        select.value = (index + 1).toString();
                        select.dispatchEvent(new Event("change"));

                    }
                }
            }
            break;
        }

        sendResponse({ payload: { text: "Hello from content.js" } });
    }
    // const headlines = Array.from(document.getElementsByTagName<"h1">("h1")).map(
    //     (h1) => h1.innerText
    // );

    // Prepare the response object with information about the site
    // const response: DOMMessageResponse = {
    //     title: document.title,
    //     headlines,
    // };

    // sendResponse(response);
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime &&
    chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
