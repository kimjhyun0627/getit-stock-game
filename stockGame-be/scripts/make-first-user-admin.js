const { DataSource } = require('typeorm');
const path = require('path');

// SQLite 데이터베이스 연결 설정
const dataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '..', 'stockgame.db'),
  synchronize: false,
  logging: true,
});

async function makeFirstUserAdmin() {
  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // 첫 번째 사용자 찾기
    const userRepository = dataSource.getRepository('user');
    const firstUser = await userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'ASC')
      .getOne();

    if (!firstUser) {
      console.log('❌ 사용자를 찾을 수 없습니다.');
      return;
    }

    console.log('🔍 첫 번째 사용자 정보:', {
      id: firstUser.id,
      name: firstUser.name,
      nickname: firstUser.nickname,
      email: firstUser.email,
      role: firstUser.role,
    });

    // Admin 권한으로 변경
    await userRepository.update(firstUser.id, { role: 'ADMIN' });

    console.log('✅ 사용자가 ADMIN으로 변경되었습니다!');

    // 변경된 사용자 정보 확인
    const updatedUser = await userRepository.findOne({
      where: { id: firstUser.id },
    });
    console.log('🎉 변경된 사용자 정보:', {
      id: updatedUser.id,
      name: updatedUser.name,
      nickname: updatedUser.nickname,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error('❌ 에러 발생:', error);
  } finally {
    await dataSource.destroy();
    console.log('📝 데이터베이스 연결 종료');
  }
}

makeFirstUserAdmin();
