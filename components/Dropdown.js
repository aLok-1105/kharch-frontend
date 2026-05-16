import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown as ElementDropdown } from 'react-native-element-dropdown';

const Dropdown = ({
    data,
    value,
    onChange,
    placeholder = 'Select item',
    labelField = 'label',
    valueField = 'value',
    style,
    ...props
}) => {
    const [isFocus, setIsFocus] = useState(false);

    return (
        <View style={styles.container}>
            <ElementDropdown
                style={[styles.dropdown, isFocus && { borderColor: '#007BFF' }, style]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={data}
                maxHeight={300}
                labelField={labelField}
                valueField={valueField}
                placeholder={!isFocus ? placeholder : '...'}
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                    onChange(item);
                    setIsFocus(false);
                }}
                {...props}
            />
        </View>
    );
};

export default Dropdown;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
    },
    dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
});
