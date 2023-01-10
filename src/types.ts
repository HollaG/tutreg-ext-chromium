export interface SiteStruct {
    name: string;
    url: string;
    searchUrl: string;
    enabled: boolean;

    icon?: string;
    id: string;
}

export interface GroupStruct {
    name: string;
    enabled: string[];
    id: string;
    number: number;
}

export interface DOMMessageResponse {
    payload: {
        text?: string;
        // sites?: SiteStruct[],
        // title?: string,
        // searchUrl?: string,
        // currentUrl? :string,
        [key: string]: any;
    };
}

export interface DOMMessage {
    type: "MODULE_DATA"|"RANK_DATA";

    // payload?: {
    //     index?: number,
    //     name?: string,
    //     url?: string,
    //     searchUrl?: string,
    //     enabled?: boolean
    // }
    payload?: any;
}

export interface SelectedClass {
    moduleCode: string;
    lessonType: string;
    classNo: string;
}
