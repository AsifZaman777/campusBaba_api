import { faker } from "@faker-js/faker";
import { Payment } from "../models";
import { Student, Course, ClassRoom } from "../models";

const seedPayments = async () => {
  try {
    const paymentCount = await Payment.countDocuments();
    if (paymentCount === 0) {
      const students = await Student.find();
      const courses = await Course.find();
      const classRooms = await ClassRoom.find();

      if (
        students.length === 0 ||
        courses.length === 0 ||
        classRooms.length === 0
      ) {
        console.log("⚠️ Please seed students, courses, and classrooms first.");
        return;
      }

      const courseById = new Map(
        courses.map((course) => [course._id.toString(), course]),
      );
      const classRoomById = new Map(
        classRooms.map((classRoom) => [classRoom._id.toString(), classRoom]),
      );

      const payments = [];
      for (const student of students) {
        if (!student.classRoomId) continue;

        const classRoom = classRoomById.get(student.classRoomId.toString());
        if (!classRoom) continue;

        const course = courseById.get(classRoom.courseId.toString());
        if (!course) continue;

        for (let i = 0; i < 2; i++) {
          // Two payments per student
          const payment = new Payment({
            studentId: student._id,
            courseId: course._id,
            amount: faker.number.int({ min: 5000, max: 20000 }),
            paymentType: faker.helpers.arrayElement(["tuition", "exam"]),
            paymentMethod: "online",
            dueDate: faker.date.past({ years: 1 }),
            paidDate: faker.date.recent(),
            paymentStatus: "paid",
            academicYear: "2023-2024",
            semester: faker.helpers.arrayElement(["Fall", "Spring"]),
          });
          payments.push(payment);
        }
      }
      await Payment.insertMany(payments);
      console.log("✅ Payments seeded");
    }
  } catch (error) {
    console.error("❌ Error seeding payments:", error);
  }
};

export default seedPayments;
