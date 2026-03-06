package com.urlshortener.repository;

import com.urlshortener.model.Click;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClickRepository extends JpaRepository<Click, Long> {
    List<Click> findByUrlIdOrderByClickedAtDesc(Long urlId, Pageable pageable);

    @Query("SELECT c.userAgent FROM Click c WHERE c.url.id = :urlId")
    List<String> findUserAgentsByUrlId(@Param("urlId") Long urlId);

    @Query(value = """
            SELECT to_char(date_trunc('day', clicked_at), 'YYYY-MM-DD') AS day,
                   COUNT(*) AS cnt
            FROM clicks
            WHERE url_id = :urlId
              AND clicked_at >= NOW() - INTERVAL '30 days'
            GROUP BY day
            ORDER BY day
            """, nativeQuery = true)
    List<Object[]> clicksPerDayLast30(@Param("urlId") Long urlId);
}
