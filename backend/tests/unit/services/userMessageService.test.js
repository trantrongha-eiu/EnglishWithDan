const userMessageService = require('../../../services/userMessageService');
const Message = require('../../../models/Message');
const { createStudent, createTeacher } = require('../../factories/userFactory');

describe('userMessageService.replyToMessage', () => {
  test('student can reply to a personal message addressed to them', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const original = await Message.create({
      fromId: teacher._id, fromName: teacher.username, toId: student._id,
      subject: 'Nhắc nhở', body: 'Em nhớ nộp bài Task 2 nhé', isBroadcast: false
    });

    const result = await userMessageService.replyToMessage(student._id, student.username, original._id, 'Dạ em nộp rồi ạ');

    expect(result.status).toBe('ok');
    expect(result.message.toId.toString()).toBe(teacher._id.toString());
    expect(result.message.fromId.toString()).toBe(student._id.toString());
    expect(result.message.parentId.toString()).toBe(original._id.toString());
    expect(result.message.subject).toBe('Re: Nhắc nhở');
    expect(result.message.body).toBe('Dạ em nộp rồi ạ');

    // Reply must be visible to the teacher via the "received" query pattern.
    const received = await Message.find({ toId: teacher._id });
    expect(received).toHaveLength(1);
    expect(received[0]._id.toString()).toBe(result.message._id.toString());
  });

  test('student can reply to a broadcast — reply routes back to the broadcaster', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const broadcast = await Message.create({
      fromId: teacher._id, fromName: teacher.username, toId: null,
      subject: 'Thông báo nghỉ lễ', body: 'Lớp nghỉ ngày mai', isBroadcast: true
    });

    const result = await userMessageService.replyToMessage(student._id, student.username, broadcast._id, 'Dạ em cảm ơn thầy');

    expect(result.status).toBe('ok');
    expect(result.message.toId.toString()).toBe(teacher._id.toString());
  });

  test('rejects a reply to a message not addressed to this student (not broadcast, different toId)', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const otherStudent = await createStudent();
    const original = await Message.create({
      fromId: teacher._id, fromName: teacher.username, toId: otherStudent._id,
      subject: 'Riêng tư', body: 'Chỉ dành cho bạn kia', isBroadcast: false
    });

    const result = await userMessageService.replyToMessage(student._id, student.username, original._id, 'Em muốn xem trộm');

    expect(result.status).toBe('forbidden');
    expect(await Message.countDocuments({ fromId: student._id })).toBe(0);
  });

  test('rejects an empty or whitespace-only reply', async () => {
    const teacher = await createTeacher();
    const student = await createStudent();
    const original = await Message.create({
      fromId: teacher._id, fromName: teacher.username, toId: student._id,
      body: 'Hi', isBroadcast: false
    });

    const result = await userMessageService.replyToMessage(student._id, student.username, original._id, '   ');
    expect(result.status).toBe('empty');
  });

  test('returns not_found for a non-existent message id', async () => {
    const student = await createStudent();
    const fakeId = new (require('mongoose').Types.ObjectId)();
    const result = await userMessageService.replyToMessage(student._id, student.username, fakeId, 'Xin chào');
    expect(result.status).toBe('not_found');
  });
});
