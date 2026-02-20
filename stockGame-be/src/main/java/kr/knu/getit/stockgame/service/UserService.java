package kr.knu.getit.stockgame.service;

import kr.knu.getit.stockgame.dto.UserDto;
import kr.knu.getit.stockgame.entity.User;
import kr.knu.getit.stockgame.entity.UserRole;
import kr.knu.getit.stockgame.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User findOne(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmailOrNickname(String email, String nickname) {
        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email);
        }
        if (nickname != null && !nickname.isBlank()) {
            return userRepository.findByNickname(nickname);
        }
        return Optional.empty();
    }

    @Transactional
    public User create(UserDto.Create dto) {
        User user = new User();
        user.setName(dto.getName() != null ? dto.getName() : "");
        user.setNickname(dto.getNickname() != null ? dto.getNickname() : "");
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole() != null ? dto.getRole() : UserRole.USER);
        user.setBalance(dto.getBalance() != null ? dto.getBalance() : new java.math.BigDecimal("10000000"));
        user.setKakaoId(dto.getKakaoId());
        user.setProfileImage(dto.getProfileImage());
        user.setIsLeaderboardVisible(true);
        return userRepository.save(user);
    }

    @Transactional
    public User update(String id, UserDto.Update dto) {
        User user = findOne(id);
        if (dto.getNickname() != null) user.setNickname(dto.getNickname());
        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getBalance() != null) user.setBalance(dto.getBalance());
        if (dto.getKakaoId() != null) user.setKakaoId(dto.getKakaoId());
        if (dto.getProfileImage() != null) user.setProfileImage(dto.getProfileImage());
        if (dto.getIsLeaderboardVisible() != null) user.setIsLeaderboardVisible(dto.getIsLeaderboardVisible());
        return userRepository.save(user);
    }

    @Transactional
    public User updateRole(String id, String role) {
        User user = findOne(id);
        user.setRole(UserRole.valueOf(role));
        return userRepository.save(user);
    }

    @Transactional
    public void remove(String id) {
        User user = findOne(id);
        userRepository.delete(user);
    }
}
