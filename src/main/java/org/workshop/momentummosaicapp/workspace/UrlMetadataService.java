package org.workshop.momentummosaicapp.workspace;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class UrlMetadataService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Metadata resolveMetadata(String url) {
        String title = null;
        WorkspaceResourceType type = WorkspaceResourceType.LINK;

        if (url == null || url.trim().isEmpty()) {
            return new Metadata("Link", type);
        }

        String lowerUrl = url.toLowerCase();
        boolean isYoutube = lowerUrl.contains("youtube.com") || lowerUrl.contains("youtu.be");

        if (isYoutube) {
            type = WorkspaceResourceType.VIDEO;
            try {
                // Try YouTube oEmbed first for reliable video titles
                String oEmbedUrl = "https://www.youtube.com/oembed?url=" + url + "&format=json";
                Map<String, Object> response = restTemplate.getForObject(oEmbedUrl, Map.class);
                if (response != null && response.containsKey("title")) {
                    title = (String) response.get("title");
                }
            } catch (Exception e) {
                // Fallback to scraping/host resolution on oEmbed failure
            }
        }

        if (title == null || title.trim().isEmpty()) {
            try {
                Document doc = Jsoup.connect(url)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                        .timeout(4000)
                        .get();
                
                // Attempt OpenGraph metadata
                title = doc.select("meta[property=og:title]").attr("content");
                if (title == null || title.trim().isEmpty()) {
                    title = doc.title();
                }
            } catch (Exception e) {
                // Ignore, fallback to hostname
            }
        }

        // Clean up title if found
        if (title != null) {
            title = cleanTitle(title, url);
        }

        // Fallback to SPA heuristics or domain name if title is missing or generic
        if (title == null || title.isEmpty() || isGenericSpamTitle(title)) {
            title = applySpaFallback(url);
        }

        // Ensure title length fits database column limits (max 200)
        if (title.length() > 200) {
            title = title.substring(0, 197) + "...";
        }

        return new Metadata(title, type);
    }

    private String cleanTitle(String title, String url) {
        String clean = title.trim();
        // Remove common boilerplate suffixes
        String[] suffixesToRemove = {
            " - YouTube", " | Medium", " - GitHub", " - Stack Overflow", " | Figma", 
            " - Twitch", " | LinkedIn", " - Wikipedia", " - Reddit"
        };
        for (String suffix : suffixesToRemove) {
            if (clean.endsWith(suffix)) {
                clean = clean.substring(0, clean.length() - suffix.length()).trim();
            }
        }
        
        // Handle common prefix/suffix patterns like "GitHub - owner/repo: description"
        if (url.contains("github.com") && clean.startsWith("GitHub - ")) {
            clean = clean.substring("GitHub - ".length()).trim();
            // Often GitHub titles are "owner/repo: description". We can keep it as is, it's descriptive enough.
        }

        return clean;
    }

    private boolean isGenericSpamTitle(String title) {
        String lower = title.toLowerCase();
        return lower.equals("chatgpt") || lower.equals("claude") || lower.equals("just a moment...") || lower.equals("access denied");
    }

    private String applySpaFallback(String url) {
        try {
            java.net.URI uri = new java.net.URI(url);
            String host = uri.getHost();
            String path = uri.getPath();
            
            if (host == null) {
                return "Link";
            }
            
            String lowerHost = host.toLowerCase();
            
            if (lowerHost.contains("chatgpt.com") || lowerHost.contains("chat.openai.com")) {
                return "ChatGPT Conversation";
            }
            if (lowerHost.contains("claude.ai")) {
                return "Claude Conversation";
            }
            if (lowerHost.contains("github.com") && path != null && path.length() > 1) {
                // e.g. /user/repo -> user/repo
                String repoPath = path.substring(1);
                if (repoPath.endsWith("/")) repoPath = repoPath.substring(0, repoPath.length() - 1);
                return repoPath;
            }

            // Generic path extraction for articles (e.g. Medium, blogs) if scraping was blocked
            if (path != null && path.length() > 1) {
                String[] segments = path.split("/");
                String lastSegment = segments[segments.length - 1];
                
                // If the last segment is meaningful (longer than 5 chars and has hyphens usually means it's a slug)
                if (lastSegment.length() > 5 && lastSegment.contains("-")) {
                    // Remove common alphanumeric hashes at the end of medium articles (e.g. -1234abcd)
                    lastSegment = lastSegment.replaceAll("-[a-f0-9]{8,12}$", "");
                    // Replace hyphens with spaces
                    String readable = lastSegment.replace("-", " ");
                    // Capitalize words
                    String[] words = readable.split(" ");
                    StringBuilder capitalized = new StringBuilder();
                    for (String word : words) {
                        if (word.length() > 0) {
                            capitalized.append(Character.toUpperCase(word.charAt(0)))
                                       .append(word.substring(1).toLowerCase())
                                       .append(" ");
                        }
                    }
                    return capitalized.toString().trim();
                }
            }
            
            return host.replace("www.", "");
        } catch (Exception e) {
            return "Link";
        }
    }

    public record Metadata(String title, WorkspaceResourceType type) {}
}
