import { useEffect, useState } from "react";
import { EditableValue } from "mendix";
import {
    AllowedDecimalSeparatorsType,
    CiphixNumberInputContainerProps,
    DecimalSeparatorBehaviorEnum,
    InputTypeEnum
} from "../../typings/CiphixNumberInputProps";

import { CiphixNumberInputSettings, displayTypeEnum, inputModeEnum, sessionLocale } from "../helpers/types";

// Parse the Mendix attribute value to the correct value for the NumbericFormat input
const getNumberValue = (input: EditableValue, inputType: InputTypeEnum): string | number => {
    if (!input || !input.value) {
        return ""; // Return an empty string instead of undefined because of a bug in NumbericFormat not re-rendering when value becomes empty
    }

    if (inputType === "string") {
        return input.displayValue;
    }

    return Number(input.value);
};

const getSeparatorOptions = (
    behavior: DecimalSeparatorBehaviorEnum,
    options: AllowedDecimalSeparatorsType[]
): string[] => {
    const separatorOptions: string[] = [];
    if (behavior === "custom") {
        options.forEach(option => {
            separatorOptions.push(option.allowedDecimalSeparator);
        });
    } else if (behavior === "lax") {
        separatorOptions.push(",");
        separatorOptions.push(".");
    }
    return separatorOptions;
};

const getMxSessionLocale = (): sessionLocale => {
    // @ts-ignore
    return mx.session.sessionData.locale.numbers;
};

const getDecimalSeparator = (useCustomSeparators: boolean, decimalSeparatorValue: string | undefined): string => {
    if (useCustomSeparators && decimalSeparatorValue) {
        return decimalSeparatorValue;
    } else {
        const sessionLocale: sessionLocale = getMxSessionLocale();
        return sessionLocale.decimalSeparator ? sessionLocale.decimalSeparator : ".";
    }
};

const getGroupingSeparator = (useCustomSeparators: boolean, thousandSeparatorValue: string | undefined): string => {
    if (useCustomSeparators && thousandSeparatorValue) {
        return thousandSeparatorValue;
    } else {
        const sessionLocale: sessionLocale = getMxSessionLocale();
        return sessionLocale.groupingSeparator ? sessionLocale.groupingSeparator : ",";
    }
};

export default function useSettings(props: CiphixNumberInputContainerProps): CiphixNumberInputSettings {
    const [numberValue, setNumberValue] = useState<string | number>();
    const [placeholderValue, setPlaceholderValue] = useState<string>();
    const [decimalScale, setDecimalScale] = useState<number>();
    const [decimalSeparatorValue, setDecimalSeparatorValue] = useState<string>();
    const [thousandSeparatorValue, setThousandSeparatorValue] = useState<string>();
    const [prefixValue, setPrefixValue] = useState<string>();
    const [suffixValue, setSuffixValue] = useState<string>();
    const [className, setClassName] = useState<string>();
    const [displayType, setDisplayType] = useState<displayTypeEnum>();
    const [disabled, setDisabled] = useState<boolean>();
    const [maxValue, setMaxValue] = useState<number | undefined>();
    const [minValue, setMinValue] = useState<number | undefined>();

    // Set numberInput based on selected inputType, allows us to continue with a single variable from here on instead of looking at string/integer/decimal-input
    const numberInput: EditableValue =
        props.inputType === "string"
            ? props.stringInput
            : props.inputType === "integer"
            ? props.integerInput
            : props.decimalInput;

    // Set the list of allowed decimal separators, when applicable
    const allowedDecimalSeparators: string[] | undefined =
        props.inputType !== "integer" && props.decimalSeparatorBehavior !== "strict"
            ? getSeparatorOptions(props.decimalSeparatorBehavior, props.allowedDecimalSeparators)
            : undefined;

    // Set fixed decimal scale true/false based on inputType and decimalMode
    const fixedDecimalScale: boolean | undefined =
        props.inputType !== "integer" ? props.decimalMode === "fixed" : undefined;

    // What kind of keyboard suggestion to send to mobile device
    const inputMode: inputModeEnum =
        props.inputType === "integer" || props.decimalPrecision === 0 ? "numeric" : "decimal";

    // Set numberInput value
    useEffect(() => {
        setNumberValue(getNumberValue(numberInput, props.inputType));
    }, [numberInput, numberInput?.value, props.inputType]);

    // Get the placeholder
    useEffect(() => {
        if (props.placeholder?.value) {
            setPlaceholderValue(props.placeholder.value);
        } else {
            setPlaceholderValue(undefined);
        }
    }, [props.placeholder?.value]);

    // DecimalScale
    useEffect(() => {
        if (props.inputType === "integer") {
            setDecimalScale(0);
        } else if (props.decimalMode === "fixed" && props.decimalPrecision) {
            setDecimalScale(props.decimalPrecision);
        } else {
            setDecimalScale(undefined);
        }
    }, [props.inputType, props.decimalMode, props.decimalPrecision]);

    // Get the decimal separator
    useEffect(() => {
        setDecimalSeparatorValue(getDecimalSeparator(props.customSeparators, props.decimalSeparator?.value));
    }, [props.customSeparators, props.decimalSeparator?.value]);

    // Get the thousands separator
    useEffect(() => {
        if (props.groupDigits) {
            setThousandSeparatorValue(getGroupingSeparator(props.customSeparators, props.thousandSeparator?.value));
        } else {
            setThousandSeparatorValue(undefined);
        }
    }, [props.customSeparators, props.groupDigits, props.thousandSeparator?.value]);

    // Get the prefix
    useEffect(() => {
        if (props.prefix?.value) {
            setPrefixValue(props.prefix.value);
        } else {
            setPrefixValue(undefined);
        }
    }, [props.prefix?.value]);

    // Get the suffix
    useEffect(() => {
        if (props.suffix?.value) {
            setSuffixValue(props.suffix.value);
        } else {
            setSuffixValue(undefined);
        }
    }, [props.suffix?.value]);

    // Check if the item is editable and set className and displayType accordingly
    useEffect(() => {
        if (numberInput?.readOnly === true && props.readOnlyStle !== "control") {
            setClassName("form-control-static widget-numberInput");
            setDisplayType("text");
            setDisabled(undefined);
        } else {
            setClassName("form-control widget-numberInput");
            setDisplayType("input");
            if (numberInput?.readOnly === true) {
                setDisabled(true);
            } else {
                setDisabled(undefined);
            }
        }
    }, [numberInput?.readOnly, props.readOnlyStle]);

    // Set the max value
    useEffect(() => {
        if (props.useMaxValue) {
            if (props.maxValueSource === "attribute") {
                setMaxValue(props.maxValueAttribute?.value?.toNumber());
            } else {
                setMaxValue(props.maxValue.toNumber());
            }
        } else {
            setMaxValue(undefined);
        }
    }, [
        props.useMaxValue,
        props.maxValueSource,
        props.maxValue,
        props.maxValueAttribute,
        props.maxValueAttribute?.value
    ]);

    // Set the min value
    useEffect(() => {
        if (props.useMinValue) {
            if (props.minValueSource === "attribute") {
                setMinValue(props.minValueAttribute?.value?.toNumber());
            } else {
                setMinValue(props.minValue.toNumber());
            }
        } else {
            setMinValue(undefined);
        }
    }, [
        props.useMinValue,
        props.minValueSource,
        props.minValue,
        props.minValueAttribute,
        props.minValueAttribute?.value
    ]);

    return {
        numberInput,
        numberValue,
        placeholderValue,
        fixedDecimalScale,
        decimalScale,
        decimalSeparatorValue,
        allowedDecimalSeparators,
        thousandSeparatorValue,
        prefixValue,
        suffixValue,
        className,
        displayType,
        inputMode,
        disabled,
        maxValue,
        minValue
    };
}
