package kr.knu.getit.stockgame.controller;

import kr.knu.getit.stockgame.dto.UserDto;
import kr.knu.getit.stockgame.entity.User;
import kr.knu.getit.stockgame.security.JwtAuthenticationFilter;
import kr.knu.getit.stockgame.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@RequestBody UserDto.Create dto) {
        return userService.create(dto);
    }

    @GetMapping
    public List<User> findAll() {
        return userService.findAll();
    }

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal JwtAuthenticationFilter.AuthPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "사용자 정보를 찾을 수 없습니다.");
        }
        return userService.findOne(principal.id());
    }

    @GetMapping("/{id}")
    public User findOne(@PathVariable String id) {
        return userService.findOne(id);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable String id, @RequestBody UserDto.Update dto) {
        return userService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable String id) {
        userService.remove(id);
    }

    @PostMapping("/make-admin")
    public Map<String, Object> makeAdmin(@RequestBody UserDto.MakeAdminRequest body) {
        User user = userService.findByEmailOrNickname(body.getEmail(), body.getNickname())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));
        User updated = userService.updateRole(user.getId(), "ADMIN");
        return Map.of(
                "message", "사용자가 관리자로 변경되었습니다.",
                "user", Map.of(
                        "id", updated.getId(),
                        "nickname", updated.getNickname(),
                        "role", updated.getRole().name(),
                        "email", updated.getEmail() != null ? updated.getEmail() : "",
                        "balance", updated.getBalance()
                )
        );
    }
}
