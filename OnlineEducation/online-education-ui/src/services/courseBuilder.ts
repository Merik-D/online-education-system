import { CourseCreateDto, ModuleCreateDto, LessonCreateDto } from '../models/creator.models';
import { CourseLevel } from '../models/enums';
import { LessonType } from '../models/enums';
export class ModuleBuilder {
  private module: ModuleCreateDto;
  private lessons: LessonCreateDto[] = [];
  constructor(title: string, order: number) {
    this.module = {
      title,
      order,
    };
  }
  withLesson(title: string, order: number, type: LessonType, content?: string): this {
    const lesson: LessonCreateDto = {
      title,
      order,
      type,
      videoUrl: type === LessonType.Video ? content : undefined,
      textContent: type === LessonType.Text ? content : undefined,
    };
    this.lessons.push(lesson);
    return this;
  }
  build(): { module: ModuleCreateDto; lessons: LessonCreateDto[] } {
    return {
      module: this.module,
      lessons: this.lessons,
    };
  }
  getLessonCount(): number {
    return this.lessons.length;
  }
}
export class CourseBuilder {
  private course: CourseCreateDto;
  private moduleBuilders: ModuleBuilder[] = [];
  constructor() {
    this.course = {
      title: '',
      description: '',
      level: CourseLevel.Beginner,
      categoryId: 1,
    };
  }
  withTitle(title: string): this {
    this.course.title = title;
    return this;
  }
  withDescription(description: string): this {
    this.course.description = description;
    return this;
  }
  withLevel(level: CourseLevel): this {
    this.course.level = level;
    return this;
  }
  withCategory(categoryId: number): this {
    this.course.categoryId = categoryId;
    return this;
  }
  addModule(title: string): ModuleBuilder {
    const order = this.moduleBuilders.length + 1;
    const moduleBuilder = new ModuleBuilder(title, order);
    this.moduleBuilders.push(moduleBuilder);
    return moduleBuilder;
  }
  getCourse(): CourseCreateDto {
    return this.course;
  }
  getModules(): { module: ModuleCreateDto; lessons: LessonCreateDto[] }[] {
    return this.moduleBuilders.map((builder) => builder.build());
  }
  getModuleCount(): number {
    return this.moduleBuilders.length;
  }
  getTotalLessonCount(): number {
    return this.moduleBuilders.reduce((sum, builder) => sum + builder.getLessonCount(), 0);
  }
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.course.title || this.course.title.trim() === '') {
      errors.push('Course title is required');
    }
    if (!this.course.description || this.course.description.trim() === '') {
      errors.push('Course description is required');
    }
    if (this.moduleBuilders.length === 0) {
      errors.push('Course must have at least one module');
    }
    this.moduleBuilders.forEach((moduleBuilder, index) => {
      const { module, lessons } = moduleBuilder.build();
      if (!module.title || module.title.trim() === '') {
        errors.push(`Module ${index + 1} title is required`);
      }
      if (lessons.length === 0) {
        errors.push(`Module "${module.title}" must have at least one lesson`);
      }
      lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title || lesson.title.trim() === '') {
          errors.push(`Lesson ${lessonIndex + 1} in module "${module.title}" title is required`);
        }
        if (lesson.type === LessonType.Video && !lesson.videoUrl) {
          errors.push(`Video lesson "${lesson.title}" must have a video URL`);
        }
        if (lesson.type === LessonType.Text && !lesson.textContent) {
          errors.push(`Text lesson "${lesson.title}" must have content`);
        }
      });
    });
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  reset(): void {
    this.course = {
      title: '',
      description: '',
      level: CourseLevel.Beginner,
      categoryId: 1,
    };
    this.moduleBuilders = [];
  }
}
export class CourseDirector {
  private builder: CourseBuilder;
  constructor(builder: CourseBuilder) {
    this.builder = builder;
  }
  constructBasicCourse(title: string, description: string): CourseBuilder {
    return this.builder
      .withTitle(title)
      .withDescription(description)
      .withLevel(CourseLevel.Beginner);
  }
  constructAdvancedCourse(title: string, description: string): CourseBuilder {
    this.builder
      .withTitle(title)
      .withDescription(description)
      .withLevel(CourseLevel.Advanced);
    this.builder.addModule('Introduction');
    this.builder.addModule('Core Concepts');
    this.builder.addModule('Advanced Topics');
    this.builder.addModule('Practical Projects');
    return this.builder;
  }
}