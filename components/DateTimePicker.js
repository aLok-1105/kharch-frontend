import { useState } from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Text, View } from "react-native";

export default function DateTimePickerComponent({ value, onDateChange, isTimeRequired }) {
    const [date, setDate] = useState(value ? new Date(value) : new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
    };

    const showTimepicker = () => {
        showMode('time');
    };

    return (
        <View>
            <Button onPress={showDatepicker} title="Select Date" />
            {isTimeRequired && <Button onPress={showTimepicker} title="Select Time" />}
            <Text>Selected: {isTimeRequired ? date.toLocaleString() : date.toLocaleDateString()}</Text>
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    onChange={(event, selectedDate) => {
                        setShow(false);
                        if (selectedDate) {
                            setDate(selectedDate);
                            if (onDateChange) {
                                onDateChange(selectedDate);
                            }
                        }
                    }}
                />
            )}
        </View>
    );
};