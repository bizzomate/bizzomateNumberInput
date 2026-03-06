import { CiphixNumberInputPreviewProps } from "../typings/CiphixNumberInputProps";
import { Properties, hidePropertiesIn, hidePropertyIn } from "@mendix/pluggable-widgets-tools";

export type Platform = "web" | "desktop";

export type Problem = {
    property?: string;
    severity?: "error" | "warning" | "deprecation";
    message: string;
    studioMessage?: string;
    url?: string;
    studioUrl?: string;
};

type BaseProps = {
    type: "Image" | "Container" | "RowLayout" | "Text" | "DropZone" | "Selectable" | "Datasource";
    grow?: number; // optionally sets a growth factor if used in a layout (default = 1)
};

type ImageProps = BaseProps & {
    type: "Image";
    document?: string; // svg image
    data?: string; // base64 image
    property?: object; // widget image property object from Values API
    width?: number; // sets a fixed maximum width
    height?: number; // sets a fixed maximum height
};

type ContainerProps = BaseProps & {
    type: "Container" | "RowLayout";
    children: PreviewProps[]; // any other preview element
    borders?: boolean; // sets borders around the layout to visually group its children
    borderRadius?: number; // integer. Can be used to create rounded borders
    backgroundColor?: string; // HTML color, formatted #RRGGBB
    borderWidth?: number; // sets the border width
    padding?: number; // integer. adds padding around the container
};

type RowLayoutProps = ContainerProps & {
    type: "RowLayout";
    columnSize?: "fixed" | "grow"; // default is fixed
};

type TextProps = BaseProps & {
    type: "Text";
    content: string; // text that should be shown
    fontSize?: number; // sets the font size
    fontColor?: string; // HTML color, formatted #RRGGBB
    bold?: boolean;
    italic?: boolean;
};

type DropZoneProps = BaseProps & {
    type: "DropZone";
    property: object; // widgets property object from Values API
    placeholder: string; // text to be shown inside the dropzone when empty
    showDataSourceHeader?: boolean; // true by default. Toggles whether to show a header containing information about the datasource
};

type SelectableProps = BaseProps & {
    type: "Selectable";
    object: object; // object property instance from the Value API
    child: PreviewProps; // any type of preview property to visualize the object instance
};

type DatasourceProps = BaseProps & {
    type: "Datasource";
    property: object | null; // datasource property object from Values API
    child?: PreviewProps; // any type of preview property component (optional)
};

export type PreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;

export function getProperties(values: CiphixNumberInputPreviewProps, defaultProperties: Properties): Properties {
    if (values.inputType === "string") {
        hidePropertiesIn(defaultProperties, values, ["decimalInput", "integerInput"]);
    } else if (values.inputType === "decimal") {
        hidePropertiesIn(defaultProperties, values, ["stringInput", "integerInput"]);
    } else if (values.inputType === "integer") {
        hidePropertiesIn(defaultProperties, values, [
            "decimalInput",
            "stringInput",
            "decimalPrecision",
            "decimalSeparator",
            "decimalMode",
            "decimalSeparatorBehavior",
            "allowedDecimalSeparators"
        ]);
    }

    if (values.useMaxValue !== true) {
        hidePropertiesIn(defaultProperties, values, ["maxValueSource", "maxValue", "maxValueAttribute"]);
    } else if (values.maxValueSource === "attribute") {
        hidePropertyIn(defaultProperties, values, "maxValue");
    } else {
        hidePropertyIn(defaultProperties, values, "maxValueAttribute");
    }

    if (values.useMinValue !== true) {
        hidePropertiesIn(defaultProperties, values, ["minValueSource", "minValue", "minValueAttribute"]);
    } else if (values.minValueSource === "attribute") {
        hidePropertyIn(defaultProperties, values, "minValue");
    } else {
        hidePropertyIn(defaultProperties, values, "minValueAttribute");
    }

    if (values.decimalSeparatorBehavior !== "custom") {
        hidePropertyIn(defaultProperties, values, "allowedDecimalSeparators");
    }

    if (!values.customSeparators) {
        hidePropertiesIn(defaultProperties, values, ["decimalSeparator", "thousandSeparator"]);
    }

    if (values.decimalMode === "auto") {
        hidePropertyIn(defaultProperties, values, "decimalPrecision");
    }

    if (!values.groupDigits) {
        hidePropertyIn(defaultProperties, values, "thousandSeparator");
    }
    if (values.onChangeBehaviour !== "during") {
        hidePropertyIn(defaultProperties, values, "onChangeAfter");
    }
    return defaultProperties;
}

export function check(values: CiphixNumberInputPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (values.useMaxValue && values.maxValueSource === "attribute" && !values.maxValueAttribute) {
        errors.push({
            property: "maxValueAttribute",
            message: "Define the attribute that contains the 'Maximum value'."
        });
    }

    if (values.useMinValue && values.minValueSource === "attribute" && !values.minValueAttribute) {
        errors.push({
            property: "minValueAttribute",
            message: "Define the attribute that contains the 'Minimum value'."
        });
    }

    return errors;
}

export function getPreview(values: CiphixNumberInputPreviewProps, isDarkMode: boolean): PreviewProps {
    // Customize your pluggable widget appearance for Studio Pro.
    return {
        type: "Container",
        borders: true,
        borderRadius: 2,
        backgroundColor: values.readOnly ? (isDarkMode ? "#646464" : "#c1c3c8") : isDarkMode ? "#313131" : "#ffffff",
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                children: [
                    {
                        type: "Text",
                        content: values.prefix,
                        fontSize: 14,
                        grow: 0
                    },
                    {
                        type: "Container",
                        borders: false,
                        padding: 6,
                        children: [
                            {
                                type: "Text",
                                fontColor: isDarkMode ? "#6DB1FE" : "#146ff4",
                                fontSize: 8,
                                content:
                                    "[" +
                                    (values.inputType === "decimal"
                                        ? values.decimalInput
                                        : values.inputType === "integer"
                                        ? values.integerInput
                                        : values.stringInput) +
                                    "]"
                            }
                        ]
                    },
                    {
                        type: "Text",
                        content: values.suffix,
                        fontSize: 14,
                        grow: 0
                    }
                ]
            }
        ]
    };
}

// export function getCustomCaption(values: CiphixNumberInputPreviewProps, platform: Platform): string {
//     return "CiphixNumberInput";
// }
