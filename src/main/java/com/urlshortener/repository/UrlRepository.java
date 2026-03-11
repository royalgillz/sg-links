package com.urlshortener.repository;

import com.urlshortener.model.Url;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortCode(String shortCode);
    boolean existsByShortCode(String shortCode);

    @Modifying
    @Query("UPDATE Url u SET u.clickCount = u.clickCount + 1 WHERE u.id = :id")
    void incrementClickCount(@Param("id") Long id);

    /** Used by BloomFilterService to hydrate on startup. */
    @Query("SELECT u.shortCode FROM Url u")
    List<String> findAllShortCodes();

    /** All links owned by a user, newest first. */
    @Query("SELECT u FROM Url u WHERE u.user.id = :userId ORDER BY u.createdAt DESC")
    List<Url> findByUserId(@Param("userId") Long userId);

    /** Public (non-password, non-expired) links for a user's link-in-bio page. */
    @Query("SELECT u FROM Url u WHERE u.user.id = :userId AND u.passwordHash IS NULL " +
           "AND (u.expiresAt IS NULL OR u.expiresAt > :now) ORDER BY u.clickCount DESC")
    List<Url> findPublicByUserId(@Param("userId") Long userId, @Param("now") OffsetDateTime now);
}
