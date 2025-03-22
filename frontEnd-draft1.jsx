// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
        <Stack.Screen name="StudentView" component={StudentView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Login Screen
const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Authentication logic to be added hete
    if (username && password) {
      navigation.navigate('TeacherDashboard');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FLEX Portal</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Student Access"
        onPress={() => navigation.navigate('StudentView')}
        color="#666"
      />
    </View>
  );
};

// Teacher Dashboard
const TeacherDashboard = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Teacher Dashboard</Text>
      
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MarkAssignment')}>
        <Text>📝 Assign Marks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AttendanceMarking')}>
        <Text>✅ Mark Attendance</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Reports')}>
        <Text>📊 Generate Reports</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Mark Assignment Screen
const MarkAssignment = () => {
  const [quizId, setQuizId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [marks, setMarks] = useState('');

  const handleSubmit = () => {
    // API call to submit marks
    Alert.alert('Success', 'Marks assigned successfully');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subHeader}>Assign Marks</Text>
      <TextInput
        placeholder="Quiz ID"
        value={quizId}
        onChangeText={setQuizId}
        style={styles.input}
      />
      <TextInput
        placeholder="Student ID"
        value={studentId}
        onChangeText={setStudentId}
        style={styles.input}
      />
      <TextInput
        placeholder="Marks"
        value={marks}
        onChangeText={setMarks}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Submit Marks" onPress={handleSubmit} />
    </ScrollView>
  );
};

// Attendance Marking Screen
const AttendanceMarking = () => {
  const [classId, setClassId] = useState('');
  const [students, setStudents] = useState([
    { id: '1', name: 'Student 1', present: false },
    { id: '2', name: 'Student 2', present: false },
  ]);

  const toggleAttendance = (studentId) => {
    const updatedStudents = students.map(student => 
      student.id === studentId ? {...student, present: !student.present} : student
    );
    setStudents(updatedStudents);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subHeader}>Mark Attendance</Text>
      <TextInput
        placeholder="Class ID"
        value={classId}
        onChangeText={setClassId}
        style={styles.input}
      />
      
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name}</Text>
            <Button
              title={item.present ? 'Present ✓' : 'Absent ✕'}
              onPress={() => toggleAttendance(item.id)}
              color={item.present ? 'green' : 'red'}
            />
          </View>
        )}
      />
      <Button title="Submit Attendance" onPress={() => Alert.alert('Success', 'Attendance recorded')} />
    </ScrollView>
  );
};

// Reports Generation Screen
const Reports = () => {
  const [reportType, setReportType] = useState('pdf');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const generateReport = () => {
    // API call to generate report
    Alert.alert('Report Generated', `Report type: ${reportType.toUpperCase()}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subHeader}>Generate Reports</Text>
      
      <View style={styles.radioGroup}>
        <Text>Report Format:</Text>
        <Button
          title="PDF"
          onPress={() => setReportType('pdf')}
          color={reportType === 'pdf' ? 'blue' : 'gray'}
        />
        <Button
          title="Excel"
          onPress={() => setReportType('excel')}
          color={reportType === 'excel' ? 'blue' : 'gray'}
        />
      </View>

      <Button title="Generate Report" onPress={generateReport} />
    </ScrollView>
  );
};

// Student View
const StudentView = () => {
  // Sample data, replace with API call
  const [studentData] = useState({
    marks: [
      { quizId: 'Q1', score: 85 },
      { quizId: 'Q2', score: 90 },
    ],
    attendance: 95.7,
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Student Portal</Text>
      
      <Text style={styles.subHeader}>Your Marks</Text>
      <FlatList
        data={studentData.marks}
        keyExtractor={item => item.quizId}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>Quiz {item.quizId}:</Text>
            <Text>{item.score}/100</Text>
          </View>
        )}
      />

      <Text style={styles.subHeader}>Attendance</Text>
      <Text style={styles.attendanceText}>
        Overall Attendance: {studentData.attendance}%
      </Text>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    borderRadius: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  attendanceText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 10,
  },
});