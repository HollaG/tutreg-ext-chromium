
export interface DOMMessageResponse {
    payload?: {
        text?: string;
        // sites?: SiteStruct[],
        // title?: string,
        // searchUrl?: string,
        // currentUrl? :string,
        [key: string]: any;
    };
    error?: string;
}

export interface DOMMessage {
    type: "MODULE_DATA"|"RANK_DATA"|"EXPAND";

    // payload?: {
    //     index?: number,
    //     name?: string,
    //     url?: string,
    //     searchUrl?: string,
    //     enabled?: boolean
    // }
    payload?: any;
    tries?: number
}

export interface SelectedClass {
    moduleCode: string;
    lessonType: string;
    classNo: string;
}
