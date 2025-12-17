import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { NotificationContainer } from './components/NotificationContainer';
import { NotificationProvider } from './context/NotificationContext';
import { SignalRProvider } from './context/SignalRContext';
import ProtectedRoute from './components/ProtectedRoute';
import InstructorRoute from './components/InstructorRoute';
import AdminOnlyRoute from './components/AdminOnlyRoute';

import HomePage from './pages/HomePage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyCoursesPage from './pages/MyCoursesPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import TestPage from './pages/TestPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminGradeSubmissionsPage from './pages/AdminGradeSubmissionsPage';
import LessonPage from './pages/LessonPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import CourseCreatePage from './pages/CourseCreatePage';
import CourseBuilderPage from './pages/CourseBuilderPage';

function App() {
  return (
    <NotificationProvider>
      <SignalRProvider>
        <BrowserRouter>
          <Navbar />
          <NotificationContainer />
          <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CourseCatalogPage />} />
            <Route path="/courses/:id" element={<CourseDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/my-courses/:id" element={<CoursePlayerPage />} />
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/my-courses/:courseId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/test/:id" element={<TestPage />} />
            </Route>

            <Route element={<InstructorRoute />}>
              <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
              <Route path="/instructor/grade-submissions" element={<AdminGradeSubmissionsPage />} />
              <Route path="/instructor/course/new" element={<CourseCreatePage />} />
              <Route path="/instructor/course/builder" element={<CourseBuilderPage />} />
              {/* <Route path="/instructor/course/:id/edit" element={<CourseEditPage />} /> */}
              
            </Route>
            <Route element={<AdminOnlyRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            </Route>

          </Routes>
        </div>
        </BrowserRouter>
      </SignalRProvider>
    </NotificationProvider>
  );
}
export default App;