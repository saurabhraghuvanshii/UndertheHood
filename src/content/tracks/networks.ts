import type { Lesson, Track } from "../types";

/** Computer networks track: naming, transport, the web stack, browser security, media and edge. */

const rfc = (n: number, title: string) => ({
  label: `RFC ${n} — ${title}`,
  url: `https://www.rfc-editor.org/rfc/rfc${n}`,
  kind: "docs" as const,
});
const note100x = { label: "100xDocs — review reminder from learner's study notes", kind: "original-note" as const };
const zineNet = { label: "Julia Evans — Networking! ACK! (zine)", url: "https://wizardzines.com/zines/networking/", kind: "external" as const };
const zineHttp = { label: "Julia Evans — HTTP: Learn your browser's language (zine)", url: "https://wizardzines.com/zines/http/", kind: "external" as const };
const hpbn = { label: "Ilya Grigorik — High Performance Browser Networking", url: "https://hpbn.co/", kind: "external" as const };
const mdnCors = { label: "MDN — Cross-Origin Resource Sharing (CORS)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS", kind: "docs" as const };
const mdnCaching = { label: "MDN — HTTP caching", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching", kind: "docs" as const };

export const track: Track = {
  slug: "networks",
  title: "Computer networks",
  tagline: "What really happens between typing a URL and seeing a page: DNS, TCP, TLS, HTTP and the browser's rules.",
  description:
    "A layered tour of the network stack as a backend or full-stack engineer meets it: how names resolve, how TCP makes an unreliable network reliable, how TLS 1.3 sets up encryption in one round trip, how HTTP evolved from 1.1 to HTTP/3 over QUIC, and the browser security rules (CORS) and caching semantics you debug every week — finishing with media streaming, ingress and content protection.",
  modules: [
    {
      id: "net-models-naming",
      title: "Models and naming",
      summary: "Layer models as a vocabulary, and DNS — how names become addresses.",
      lessons: ["osi-tcp-ip", "dns"],
    },
    {
      id: "net-transport",
      title: "Transport",
      summary: "TCP's reliability, flow and congestion control, and when UDP is the better base.",
      lessons: ["tcp", "udp"],
    },
    {
      id: "net-web-stack",
      title: "The web stack",
      summary: "TLS, HTTP/1.1 → 2 → 3, WebSockets, HTTP caching and debugging with curl.",
      lessons: ["tls-handshake", "http", "websockets", "http-caching", "curl-debugging"],
    },
    {
      id: "net-browser-security",
      title: "Browser security",
      summary: "The same-origin policy and CORS: what the browser enforces and what it doesn't.",
      lessons: ["cors"],
    },
    {
      id: "net-media-edge",
      title: "Media and edge",
      summary: "Streaming protocols, ingress and secure routing, and DRM/content protection.",
      lessons: ["streaming-protocols", "ingress-routing", "drm-content-protection"],
    },
  ],
  milestones: [
    {
      id: "net-http-server-raw-tcp",
      title: "HTTP/1.1 server on raw TCP",
      summary: "Parse HTTP/1.1 requests yourself from a raw TCP socket (Node `net` module or Go `net.Listen`) and write correct responses.",
      level: "intermediate",
      requirements: [
        "Accept TCP connections and buffer bytes until a full request head (`\\r\\n\\r\\n`) arrives — reads do not align with messages",
        "Parse the request line and headers; handle `Content-Length` request bodies",
        "Write a status line, `Content-Length`, `Content-Type` and body; return 400 for malformed requests and 404 for unknown paths",
        "Support persistent connections (keep-alive) and `Connection: close`; close idle connections after a timeout",
      ],
      stretch: [
        "Chunked transfer encoding for responses",
        "Serve static files with `ETag` and answer `If-None-Match` with 304",
        "Compare behaviour against `curl -v` and a load tool",
      ],
      exercises: ["networks/tcp", "networks/http", "networks/http-caching", "networks/curl-debugging"],
    },
    {
      id: "net-iterative-resolver",
      title: "DNS lookup tool with iterative resolution",
      summary: "Build a tiny resolver that starts at a root server and follows referrals to the authoritative answer, with a TTL cache.",
      level: "advanced",
      requirements: [
        "Encode a DNS query message (header + question) and send it over UDP port 53",
        "Decode answers, authority (NS) and additional (glue A/AAAA) sections",
        "Follow referrals root → TLD → authoritative; print each hop",
        "Cache records by (name, type) honouring TTLs, including negative answers (NXDOMAIN) using the SOA minimum",
      ],
      stretch: ["Fall back to TCP when the response is truncated (TC bit)", "Resolve CNAME chains"],
      exercises: ["networks/dns", "networks/udp", "system-design/dns-tcp-lb-firewalls"],
    },
    {
      id: "net-caching-proxy",
      title: "Caching HTTP reverse proxy",
      summary: "A reverse proxy that forwards requests to an origin and caches responses according to HTTP caching rules.",
      level: "advanced",
      requirements: [
        "Respect `Cache-Control` (`max-age`, `no-store`, `private`, `s-maxage`) and `Vary`",
        "Revalidate stale entries with `If-None-Match` / `If-Modified-Since`",
        "Add `Age` and an `X-Cache: HIT|MISS` header",
        "Expose hit ratio metrics",
      ],
      stretch: ["`stale-while-revalidate` support", "Request coalescing so one miss triggers one origin fetch"],
      exercises: ["networks/http-caching", "networks/http", "system-design/cdn-edge-caching", "system-design/caching-strategies"],
    },
  ],
  sources: [
    rfc(9110, "HTTP Semantics"),
    rfc(9111, "HTTP Caching"),
    rfc(9112, "HTTP/1.1"),
    rfc(9113, "HTTP/2"),
    rfc(9114, "HTTP/3"),
    rfc(9000, "QUIC: A UDP-Based Multiplexed and Secure Transport"),
    rfc(9293, "Transmission Control Protocol (TCP)"),
    rfc(8446, "The Transport Layer Security (TLS) Protocol Version 1.3"),
    rfc(6455, "The WebSocket Protocol"),
    rfc(1034, "Domain Names — Concepts and Facilities"),
    rfc(1035, "Domain Names — Implementation and Specification"),
    rfc(768, "User Datagram Protocol"),
    rfc(8216, "HTTP Live Streaming"),
    mdnCors,
    mdnCaching,
    zineNet,
    zineHttp,
    { label: "Julia Evans — Mess With DNS", url: "https://messwithdns.net/", kind: "external" },
    hpbn,
    note100x,
  ],
};

export const lessons: Lesson[] = [
  // ───────────────────────────── osi-tcp-ip (outline) ─────────────────────────────
  {
    slug: "osi-tcp-ip",
    track: "networks",
    title: "OSI vs TCP/IP models",
    summary:
      "Layer models are a shared vocabulary, not a description of real code: the 7-layer OSI model versus the 4-layer TCP/IP model, and where Ethernet, IP, TCP/UDP, TLS and HTTP sit.",
    level: "beginner",
    frequency: "high",
    minutes: 15,
    kinds: ["theory"],
    status: "outline",
    prerequisites: [],
    related: ["networks/tcp", "networks/udp", "networks/http", "system-design/dns-tcp-lb-firewalls"],
    tags: ["osi", "tcp-ip", "layers", "encapsulation"],
    sources: [zineNet, rfc(9293, "Transmission Control Protocol (TCP)"), note100x],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Name the 7 OSI layers and the 4 TCP/IP layers and map one onto the other",
              "Explain encapsulation: frame ⊃ packet ⊃ segment/datagram ⊃ application data",
              "Place common protocols (Ethernet, Wi-Fi, IP, ICMP, TCP, UDP, QUIC, TLS, HTTP, DNS) on the model",
              "Use layer vocabulary precisely (an \"L4 load balancer\" vs an \"L7 load balancer\")",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "OSI (physical, data link, network, transport, session, presentation, application) is a teaching model; the Internet is built on the TCP/IP model (link, internet, transport, application).",
              "Encapsulation and headers added at each layer; MTU and fragmentation basics.",
              "Why modern protocols blur layers: TLS sits between transport and application; QUIC folds transport + TLS into user space over UDP.",
              "How this vocabulary shows up in load balancers, firewalls and debugging tools.",
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── dns ─────────────────────────────
  {
    slug: "dns",
    track: "networks",
    title: "DNS: how names become addresses",
    summary:
      "The Domain Name System is a distributed, cached, hierarchical database. Learn the stub → recursive resolver → root → TLD → authoritative path, recursive vs iterative queries, and why TTLs make DNS changes slow.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory", "visualization"],
    status: "authored",
    prerequisites: ["networks/osi-tcp-ip"],
    related: ["networks/udp", "networks/tcp", "networks/http", "system-design/dns-tcp-lb-firewalls", "system-design/cdn-edge-caching", "cloud/cdn-cloudfront"],
    tags: ["dns", "resolver", "ttl", "caching", "recursive", "iterative"],
    sources: [
      rfc(1034, "Domain Names — Concepts and Facilities"),
      rfc(1035, "Domain Names — Implementation and Specification"),
      { label: "RFC 2308 — Negative Caching of DNS Queries", url: "https://www.rfc-editor.org/rfc/rfc2308", kind: "docs" },
      { label: "Julia Evans — Mess With DNS", url: "https://messwithdns.net/", kind: "external" },
      zineNet,
      note100x,
    ],
    questions: ["networks/net-01"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Trace a lookup from the stub resolver through the recursive resolver to root, TLD and authoritative servers",
              "Distinguish recursive queries (\"give me the final answer\") from iterative queries (\"give me your best referral\")",
              "Explain caching at every layer and how TTLs (including negative TTLs) control staleness",
              "Read `dig` output and recognise common record types: A, AAAA, CNAME, NS, MX, TXT, SOA",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Think of DNS as asking for directions in a city where nobody knows everything. You ask a concierge (your **recursive resolver**). The concierge asks a city-level information desk (the **root**), which says \"for `.com` addresses, ask that office\". The `.com` office (the **TLD**) says \"for `example.com`, ask their front desk\". The front desk (the **authoritative server**) finally gives the exact address.",
          },
          {
            type: "p",
            text: "The concierge writes every answer in a notebook with an expiry time (the **TTL**), so the next guest asking for the same place gets an answer instantly.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**DNS** maps hierarchical names (`www.example.com.`) to **resource records** (RRs) such as IP addresses. The namespace is a tree split into **zones**, each served by **authoritative name servers**. Every record carries a **TTL** (seconds) saying how long others may cache it.",
          },
          {
            type: "table",
            head: ["Role", "What it does", "Example"],
            rows: [
              ["Stub resolver", "Library in your OS/app; sends one recursive query and waits", "glibc `getaddrinfo`, systemd-resolved"],
              ["Recursive resolver", "Does the legwork: walks the tree iteratively, caches results", "ISP resolver, 1.1.1.1, 8.8.8.8, corporate resolver"],
              ["Root servers", "Know where each TLD's servers are", "a.root-servers.net … m.root-servers.net (13 names, many anycast instances)"],
              ["TLD servers", "Know the authoritative servers for each domain in the TLD", "`.com`, `.org`, `.io` servers"],
              ["Authoritative server", "Holds the zone's actual records", "Route 53, Cloudflare DNS, your own BIND"],
            ],
          },
          {
            type: "table",
            head: ["Record", "Meaning"],
            rows: [
              ["A / AAAA", "IPv4 / IPv6 address"],
              ["CNAME", "Alias: this name is another name (can't coexist with other records at that name)"],
              ["NS", "Delegation: these servers are authoritative for this zone"],
              ["MX", "Mail servers for the domain"],
              ["TXT", "Arbitrary text — SPF, domain verification"],
              ["SOA", "Zone metadata, including the negative-caching TTL"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Every HTTP request to a hostname starts with DNS (unless cached) — it is on the critical path of page loads and service calls.",
              "DNS is a common lever for traffic management: failover, geo-routing, blue/green cutovers, CDNs.",
              "Many outages are DNS outages or DNS-caching surprises (\"we changed the record an hour ago, why do some users still hit the old IP?\").",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "There are two query styles. In a **recursive** query (the RD — \"recursion desired\" — bit set) the client asks the server to return the final answer or an error. In an **iterative** query the server answers with what it knows: either the answer or a **referral** (NS records plus \"glue\" addresses) pointing one level down.",
          },
          {
            type: "compare",
            items: [
              {
                title: "Recursive (stub → resolver)",
                points: [
                  "Client sends one question, gets one final answer",
                  "The resolver does all the work and caches it",
                  "What your laptop and servers do",
                ],
              },
              {
                title: "Iterative (resolver → root/TLD/authoritative)",
                points: [
                  "Each server returns an answer or a referral",
                  "The resolver follows referrals step by step",
                  "Root and TLD servers don't do recursion for you",
                ],
              },
            ],
          },
          {
            type: "p",
            text: "Transport: queries normally go over **UDP port 53** because one small question/answer fits in a datagram. If a response is too large the server sets the **TC (truncated)** bit and the client retries over **TCP port 53**; zone transfers also use TCP. EDNS(0) lets clients advertise larger UDP buffers. Encrypted variants exist: DNS over TLS (port 853) and DNS over HTTPS.",
          },
          {
            type: "p",
            text: "**Caching** happens everywhere: the browser, the OS stub resolver, the recursive resolver. Each cache keeps a record for at most its TTL, counting down. **Negative caching** (RFC 2308) caches \"this name does not exist\" (NXDOMAIN) too, for a duration derived from the zone's SOA record — so creating a record right after someone looked it up may not be visible immediately.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Caches don't all behave the same",
            text: "The protocol says a TTL is an upper bound on caching. In practice, browsers keep their own short-lived host caches, some resolvers clamp TTLs to minimum/maximum values, and long-lived processes (some JVM configurations, connection pools) may hold an IP for much longer than the TTL. Node's `dns.lookup` does no caching of its own — it calls the OS resolver (`getaddrinfo`) on libuv's thread pool.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "1. App asks the stub resolver", detail: "`fetch(\"https://www.example.com\")` → the OS checks `/etc/hosts` and its cache; on a miss it sends a recursive query to the configured resolver (e.g. 1.1.1.1)." },
              { title: "2. Resolver checks its cache", detail: "If it has a fresh `www.example.com A` record, it answers immediately. Otherwise it starts iterating, beginning from the closest cached ancestor (often it already knows the `.com` servers)." },
              { title: "3. Ask a root server", detail: "\"Where is `www.example.com`?\" → a referral: \"`.com` is served by a.gtld-servers.net … here are their IPs (glue)\"." },
              { title: "4. Ask a `.com` TLD server", detail: "→ a referral: \"`example.com` is served by ns1.example-dns.net …\"." },
              { title: "5. Ask the authoritative server", detail: "→ the answer: `www.example.com. 300 IN A 93.184.215.14` (the AA — authoritative answer — flag is set)." },
              { title: "6. Resolver caches and replies", detail: "It caches each record for its TTL (referrals too), then returns the answer to the stub, which caches it and hands the IP to the app. Next: TCP connect." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "sys-request-flow", caption: "DNS is the first hop of every request to a hostname; on a warm cache it costs almost nothing, on a cold one several round trips." },
          { type: "flow", nodes: ["Stub resolver", "Recursive resolver", "Root", "TLD (.com)", "Authoritative"], caption: "Conceptual path of a cold lookup. Only the first arrow is a recursive query; the rest are iterative." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "bash",
            code: `# Ask your configured resolver (recursive query)
dig www.example.com A +noall +answer

# Watch the iterative walk from the root yourself
dig www.example.com +trace

# Ask an authoritative server directly, no recursion
dig @a.iana-servers.net example.com A +norecurse`,
            caption: "Illustrative — IPs, TTLs and server names vary over time and by resolver. Run the first command twice and watch the TTL count down.",
            output: `www.example.com.	271	IN	A	93.184.215.14`,
          },
          {
            type: "code",
            lang: "js",
            code: `// Node: two different resolution paths
import dns from "node:dns";

// Uses the OS resolver (getaddrinfo) on libuv's thread pool; respects /etc/hosts
dns.lookup("localhost", (err, address) => console.log("lookup:", address));

// Sends DNS queries over the network itself (c-ares), ignores /etc/hosts
dns.promises.resolve4("example.com").then((ips) => console.log("resolve4:", ips));`,
            caption: "Illustrative output order and values vary.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**CNAME at the zone apex** isn't allowed (it can't coexist with SOA/NS); providers offer ALIAS/ANAME/flattening instead.",
              "**Lowering TTL before a migration** only helps if you lower it at least one *old* TTL in advance — caches still hold the old long TTL.",
              "**NXDOMAIN cached**: querying a name before creating it can delay its visibility by the negative TTL.",
              "**Split-horizon DNS** returns different answers inside and outside a network (common in corporate and Kubernetes setups).",
              "**DNS-based load balancing** is coarse: clients cache, so traffic shifts slowly and unevenly.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          { type: "callout", tone: "misconception", title: "\"DNS propagation\"", text: "Nothing is pushed or propagated. Authoritative servers update quickly; what you're waiting for is caches around the world expiring old records according to their TTLs." },
          { type: "callout", tone: "misconception", title: "\"The root servers know every domain\"", text: "Root servers only know the TLD delegations. Each level only knows who to ask next." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Choice", "Benefit", "Cost"],
            rows: [
              ["Long TTL (hours/days)", "Fewer lookups, resilient if authoritative servers are down", "Changes and failovers take a long time to take effect"],
              ["Short TTL (30–60 s)", "Fast failover and traffic shifting", "More queries, more latency on cache misses, more load on DNS provider"],
              ["DNS-based failover/geo routing", "Simple, global, no extra hop", "Coarse and cache-dependent; can't react per request"],
              ["Encrypted DNS (DoH/DoT)", "Privacy from on-path observers", "Bypasses local resolver policy; another TLS connection"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "DNS turns a name into records like IP addresses. The app's stub resolver sends a recursive query to a recursive resolver; on a cache miss the resolver queries iteratively — root for the TLD's servers, TLD for the domain's authoritative servers, then the authoritative server for the record. Every answer has a TTL and is cached at each layer, which is why changes take time to be seen. It's usually UDP on port 53, falling back to TCP for large responses.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Mention negative caching and SOA — interviewers like the \"we queried before creating it\" story.",
              "Distinguish anycast (many servers share one IP, routed to the nearest) from DNS geo-routing (different answers per client location).",
              "Explain why DNS failover is slow (client and resolver caching, apps that pin IPs) and what complements it (load-balancer health checks).",
              "Tie it to latency: a cold lookup can cost several round trips; browsers mitigate with `dns-prefetch` / `preconnect`.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Hierarchy: root → TLD → authoritative; each level delegates with NS records.",
              "Stub → recursive resolver is recursive; resolver → servers is iterative.",
              "Caches everywhere, bounded by TTL; negative answers are cached too.",
              "UDP 53 by default, TCP 53 for truncation and zone transfers.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Resolver (recursive)", definition: "A server that answers clients' recursive queries by walking the DNS tree and caching results." },
      { term: "Stub resolver", definition: "The minimal client-side resolver in the OS/app that forwards queries to a recursive resolver." },
      { term: "Authoritative server", definition: "A name server that holds the definitive records for a zone." },
      { term: "Zone", definition: "A part of the DNS namespace administered as a unit (e.g. `example.com`)." },
      { term: "TTL", definition: "Time to live: how many seconds a record may be cached." },
      { term: "Referral", definition: "A response containing NS records (and glue) telling the resolver which servers to ask next." },
      { term: "Glue record", definition: "An A/AAAA record for a name server included with a referral, so the resolver can reach it without another lookup." },
      { term: "NXDOMAIN", definition: "Response code meaning the queried name does not exist." },
      { term: "Anycast", definition: "Announcing the same IP from many locations so routing delivers packets to the nearest one." },
    ],
    followUps: [
      { q: "Why is DNS mostly UDP?", a: "A typical query and answer fit in one datagram, so UDP avoids TCP's handshake round trip and connection state on busy servers. Large responses fall back to TCP via the TC bit." },
      { q: "You changed an A record but some users still reach the old server. Why?", a: "Their resolvers (or OS/browser/app) cached the old record and will keep it until its TTL expires; some applications cache resolved IPs even longer. Lower the TTL well before planned changes and keep the old server serving during the overlap." },
      { q: "What is the difference between `dns.lookup` and `dns.resolve` in Node?", a: "`dns.lookup` uses the OS `getaddrinfo` (honours /etc/hosts and nsswitch) and runs on libuv's thread pool; `dns.resolve*` performs network DNS queries via c-ares and doesn't use the thread pool." },
      { q: "How do CDNs use DNS?", a: "They often hand out a CNAME to their own domain and answer with edge IPs chosen by location/health, frequently combined with anycast." },
    ],
    quiz: [
      {
        id: "dns-q1",
        prompt: "Which component usually performs iterative queries to root, TLD and authoritative servers?",
        options: ["The browser", "The stub resolver", "The recursive resolver", "The authoritative server"],
        answer: 2,
        explanation: "The stub sends one recursive query; the recursive resolver does the iterative walk and caches the results.",
      },
      {
        id: "dns-q2",
        prompt: "A record has TTL 86400. You change it and lower the TTL to 60 at the same moment. How long might clients still see the old value?",
        options: ["About 60 seconds", "Up to about 24 hours", "Never — changes are pushed", "Exactly 1 hour"],
        answer: 1,
        explanation: "Caches that fetched the old record keep it for its old TTL (up to 86400 s). The new TTL only applies to future fetches.",
      },
      {
        id: "dns-q3",
        prompt: "When does a DNS client retry a query over TCP?",
        options: ["Always for AAAA records", "When the UDP response has the TC (truncated) bit set", "When the TTL is zero", "Only with DNSSEC disabled"],
        answer: 1,
        explanation: "A truncated UDP response signals the answer didn't fit; the client retries over TCP port 53.",
      },
    ],
  },

  // ───────────────────────────── tcp ─────────────────────────────
  {
    slug: "tcp",
    track: "networks",
    title: "TCP: reliable byte streams over an unreliable network",
    summary:
      "How TCP turns lossy, reordering IP packets into an ordered byte stream: the 3-way handshake, sequence numbers and ACKs, retransmission, flow control (rwnd) vs congestion control (cwnd), head-of-line blocking and TIME_WAIT.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 45,
    kinds: ["theory", "visualization"],
    status: "authored",
    prerequisites: ["networks/osi-tcp-ip"],
    related: ["networks/udp", "networks/tls-handshake", "networks/http", "system-design/dns-tcp-lb-firewalls", "system-design/latency-throughput", "system-design/load-balancing-algorithms"],
    tags: ["tcp", "handshake", "flow-control", "congestion-control", "head-of-line-blocking", "time-wait"],
    sources: [
      rfc(9293, "Transmission Control Protocol (TCP)"),
      { label: "RFC 5681 — TCP Congestion Control", url: "https://www.rfc-editor.org/rfc/rfc5681", kind: "docs" },
      { label: "RFC 9438 — CUBIC for Fast and Long-Distance Networks", url: "https://www.rfc-editor.org/rfc/rfc9438", kind: "docs" },
      { label: "High Performance Browser Networking — Building Blocks of TCP", url: "https://hpbn.co/building-blocks-of-tcp/", kind: "external" },
      zineNet,
      note100x,
    ],
    questions: ["networks/net-01", "networks/net-02"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Walk through the 3-way handshake and explain why initial sequence numbers are exchanged",
              "Explain how sequence numbers, ACKs and retransmission provide reliable, ordered delivery",
              "Separate flow control (protect the receiver, `rwnd`) from congestion control (protect the network, `cwnd`)",
              "Describe TCP head-of-line blocking and why it matters for HTTP/2 and QUIC",
              "Explain connection teardown and TIME_WAIT",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "IP is like posting numbered postcards: some get lost, some arrive out of order, some arrive twice. TCP is the pair of clerks at each end who number every byte, keep copies of what they sent, re-send anything not acknowledged, and reassemble the postcards into the original letter before handing it to your program.",
          },
          {
            type: "p",
            text: "On top of that, the sender is polite twice over: it never sends more than the receiver says it has room for, and it slows down when the road (the network) looks congested.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**TCP** (RFC 9293) is a connection-oriented transport protocol providing a **reliable, ordered, full-duplex byte stream** between two endpoints identified by the 4-tuple (source IP, source port, destination IP, destination port). It has no notion of messages — application protocols must add their own framing (e.g. HTTP's `Content-Length`).",
          },
          {
            type: "table",
            head: ["Mechanism", "Purpose"],
            rows: [
              ["Sequence numbers + ACKs", "Ordering, duplicate detection, knowing what arrived"],
              ["Retransmission (timeout, fast retransmit)", "Recover lost segments"],
              ["Checksum", "Detect corrupted segments"],
              ["Receive window (`rwnd`)", "Flow control: don't overflow the receiver's buffer"],
              ["Congestion window (`cwnd`)", "Congestion control: don't overload the network"],
              ["Handshake / FIN / RST", "Connection setup and teardown"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "HTTP/1.1, HTTP/2, TLS, database protocols, SSH and gRPC all run over TCP — its behaviour shapes their latency.",
              "The handshake costs one round trip before any data; on a 100 ms RTT link that's visible to users.",
              "Slow start explains why new connections are slow and why connection reuse/pooling matters.",
              "Production issues — port exhaustion, TIME_WAIT pile-ups, retransmission storms — are TCP issues.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "**Handshake.** Each side picks a random **initial sequence number (ISN)**. The client sends `SYN(seq=x)`, the server replies `SYN-ACK(seq=y, ack=x+1)`, the client sends `ACK(ack=y+1)`. Now both sides know each other's starting numbers and that the path works in both directions. Randomised ISNs make it hard to inject forged segments and keep old duplicate segments from being accepted by a new connection.",
          },
          {
            type: "p",
            text: "**Reliability.** Sequence numbers count *bytes*. An ACK carries the next byte the receiver expects (cumulative). The sender keeps unacknowledged data and retransmits after a **retransmission timeout (RTO)** derived from measured RTT, or earlier via **fast retransmit** after three duplicate ACKs. SACK (selective acknowledgement) lets the receiver report which later blocks arrived.",
          },
          {
            type: "compare",
            items: [
              {
                title: "Flow control (rwnd)",
                points: [
                  "Protects the receiver",
                  "Receiver advertises free buffer space in every ACK",
                  "Slow consumer → window shrinks to zero → sender pauses (zero-window probes)",
                  "Same idea as stream backpressure in application code",
                ],
              },
              {
                title: "Congestion control (cwnd)",
                points: [
                  "Protects the network",
                  "Sender-side estimate; never advertised",
                  "Slow start: cwnd grows roughly exponentially per RTT until loss or ssthresh",
                  "Then congestion avoidance: additive increase, multiplicative decrease on loss (Reno/CUBIC)",
                ],
              },
            ],
          },
          {
            type: "p",
            text: "The sender may have in flight at most `min(rwnd, cwnd)` unacknowledged bytes. Throughput is therefore bounded by window / RTT — the **bandwidth-delay product** tells you how big the window must be to fill a link.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Congestion control algorithms are an OS choice",
            text: "The RFCs define the framework (RFC 5681) and specific algorithms. Linux has defaulted to **CUBIC** for years; Google's **BBR** models bottleneck bandwidth and RTT instead of reacting to loss and can be enabled per host. Initial window size (commonly 10 segments, RFC 6928), RTO minimums, TIME_WAIT duration and buffer autotuning are all OS-specific defaults.",
          },
          {
            type: "p",
            text: "**Head-of-line (HOL) blocking.** Because TCP delivers bytes strictly in order, one lost segment stalls delivery of everything after it — even data that already arrived — until the retransmission lands. If several logical streams share one connection (HTTP/2), one loss stalls all of them. QUIC fixes this by doing ordering per stream.",
          },
          {
            type: "p",
            text: "**Teardown.** Each direction is closed separately with `FIN` / `ACK` (so four segments, sometimes combined). The side that closes first enters **TIME_WAIT** for 2×MSL (maximum segment lifetime) so late duplicates of the old connection can't be mistaken for a new one using the same 4-tuple, and so it can re-ACK a lost final FIN. `RST` aborts a connection immediately.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "SYN", detail: "Client → server: `SYN seq=1000`. Client state: SYN_SENT." },
              { title: "SYN-ACK", detail: "Server → client: `SYN seq=5000, ACK ack=1001`. Server state: SYN_RECEIVED (the kernel queues it in the SYN backlog)." },
              { title: "ACK", detail: "Client → server: `ACK ack=5001`. Both ESTABLISHED; the connection moves to the accept queue until the app calls `accept()`. The client may piggyback data on this ACK." },
              { title: "Data", detail: "Client sends 500 bytes `seq=1001`. Server ACKs with `ack=1501` and advertises `rwnd=65535`." },
              { title: "Loss", detail: "Client sends segments 1501–2000 (lost) and 2001–2500 (arrives). Server can't deliver 2001–2500 to the app yet and keeps ACKing 1501 (duplicate ACKs)." },
              { title: "Recovery", detail: "After duplicate ACKs (or RTO), the client retransmits 1501–2000; the server ACKs 2501 and releases both blocks to the app in order. cwnd is reduced." },
              { title: "Close", detail: "Client sends FIN, server ACKs; server sends FIN, client ACKs and sits in TIME_WAIT for 2×MSL." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "sys-request-flow", caption: "TCP connect is the round trip after DNS and before TLS — reusing connections skips it." },
          { type: "flow", nodes: ["SYN", "SYN-ACK", "ACK (+ data)"], caption: "Conceptual 3-way handshake: one RTT before the client can send application data." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "bash",
            code: `# See connection states on Linux (ss replaces netstat)
ss -tan state time-wait | head
ss -tni dst 93.184.215.14   # per-connection cwnd, rtt, retransmits

# Which congestion control algorithm is in use?
sysctl net.ipv4.tcp_congestion_control`,
            caption: "Illustrative — exact fields and defaults depend on the kernel.",
            output: `net.ipv4.tcp_congestion_control = cubic`,
          },
          {
            type: "code",
            lang: "js",
            code: `// TCP is a byte stream: one write is NOT one read.
import net from "node:net";

const server = net.createServer((sock) => {
  let buf = "";
  sock.on("data", (chunk) => {
    buf += chunk;                       // chunks may split or merge messages
    let i;
    while ((i = buf.indexOf("\\n")) >= 0) { // application-level framing
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      sock.write(\`echo: \${line}\\n\`);
    }
  });
});
server.listen(4000);`,
            caption: "Framing by newline. Without it, a message can arrive split across two `data` events or glued to the next one.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**SYN flood**: attackers fill the SYN backlog with half-open connections; SYN cookies let the server avoid storing state until the final ACK.",
              "**Nagle's algorithm + delayed ACK** can add ~40 ms+ latency to small request/response writes; `TCP_NODELAY` disables Nagle (Node sockets: `setNoDelay(true)`).",
              "**Ephemeral port exhaustion**: many short-lived outbound connections to one destination leave sockets in TIME_WAIT on the client side; fix with connection reuse (keep-alive, pooling).",
              "**Half-open connections**: a peer vanishes without FIN/RST; without keep-alive probes or app timeouts the socket looks alive forever.",
              "**Middleboxes** (NATs, load balancers, firewalls) drop idle connections silently after their own timeouts.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          { type: "callout", tone: "misconception", title: "\"TCP preserves message boundaries\"", text: "It doesn't. Two `write`s can arrive as one `read`, and one `write` can arrive in pieces. Always frame your messages." },
          { type: "callout", tone: "misconception", title: "\"Flow control and congestion control are the same\"", text: "Flow control is about the receiver's buffer (advertised `rwnd`); congestion control is the sender's estimate of what the network can carry (`cwnd`). Both limit in-flight data." },
          { type: "callout", tone: "misconception", title: "\"TCP guarantees delivery\"", text: "It guarantees in-order delivery *or* an error. If the peer or path dies, data in buffers may never arrive and the app learns via a reset or timeout — hence application-level acknowledgements and idempotency." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Property", "Benefit", "Cost"],
            rows: [
              ["Connection setup", "Both sides agree on state and ISNs", "1 RTT before data (plus TLS)"],
              ["Strict in-order delivery", "Simple programming model", "Head-of-line blocking on loss"],
              ["Congestion control", "Fair sharing, prevents collapse", "Slow start makes new connections slow"],
              ["Kernel implementation", "Fast, mature, everywhere", "Hard to evolve; middleboxes ossify it (one reason QUIC lives in user space over UDP)"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "TCP gives a reliable, ordered byte stream over IP. It opens with a 3-way handshake (SYN, SYN-ACK, ACK) that exchanges initial sequence numbers; then every byte is numbered and acknowledged, and lost data is retransmitted. Flow control uses the receiver's advertised window so a fast sender can't overwhelm a slow receiver, while congestion control (slow start, then CUBIC/BBR-style avoidance) limits the sender based on network conditions. Strict ordering causes head-of-line blocking, and the side that closes first sits in TIME_WAIT.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Why 3 messages, not 2? Each side must both send its ISN and have it acknowledged; the server's SYN and ACK are combined. Two messages wouldn't confirm the server's ISN reached the client.",
              "Throughput ≈ window / RTT; long fat networks need window scaling.",
              "Tie HOL blocking to protocol evolution: HTTP/1.1 (one request at a time per connection) → HTTP/2 (multiplexed but TCP HOL) → HTTP/3 over QUIC (per-stream ordering).",
              "Operational angle: keep-alive and pooling avoid handshakes, slow start and TIME_WAIT churn.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "3-way handshake exchanges ISNs; costs 1 RTT.",
              "Byte sequence numbers + cumulative ACKs + retransmission = reliable ordered stream (no message boundaries).",
              "In flight ≤ min(rwnd, cwnd): flow control protects the receiver, congestion control the network.",
              "Ordering causes HOL blocking; TIME_WAIT protects new connections from old segments.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Segment", definition: "A TCP protocol data unit: header plus a slice of the byte stream." },
      { term: "ISN", definition: "Initial sequence number, chosen randomly by each side during the handshake." },
      { term: "ACK", definition: "Acknowledgement; in TCP it carries the next byte number the receiver expects." },
      { term: "RTT", definition: "Round-trip time: time for a packet to go to the peer and a response to come back." },
      { term: "RTO", definition: "Retransmission timeout, computed from smoothed RTT measurements." },
      { term: "rwnd", definition: "Receive window: free buffer space the receiver advertises (flow control)." },
      { term: "cwnd", definition: "Congestion window: the sender's estimate of how much data the network can absorb." },
      { term: "Slow start", definition: "Phase where cwnd grows roughly exponentially each RTT until loss or a threshold." },
      { term: "Head-of-line blocking", definition: "Later data waits behind an earlier lost or delayed piece because delivery must be in order." },
      { term: "TIME_WAIT", definition: "State held by the side that closes first, for 2×MSL, to absorb late segments and re-ACK a lost FIN." },
    ],
    followUps: [
      { q: "What happens if the final ACK of the handshake is lost?", a: "The server stays in SYN_RECEIVED and retransmits SYN-ACK. If the client sends data, that data segment carries the ACK and completes the handshake anyway." },
      { q: "Why do servers sometimes have many TIME_WAIT sockets?", a: "Whoever closes first gets TIME_WAIT. If the server closes connections (e.g. after each HTTP/1.0 response), it accumulates them. Keep-alive reduces closes; on clients, reuse connections to avoid ephemeral port exhaustion." },
      { q: "How does QUIC avoid TCP's head-of-line blocking?", a: "QUIC runs over UDP and keeps ordering per stream, so a lost packet only stalls the streams whose data it carried." },
      { q: "What is the bandwidth-delay product?", a: "Bandwidth × RTT: the amount of data that must be in flight to keep the link full. The window (min of rwnd and cwnd) must be at least that large to reach full throughput." },
    ],
    quiz: [
      {
        id: "tcp-q1",
        prompt: "A receiver's application reads slowly and its buffer fills up. Which mechanism stops the sender?",
        options: ["Congestion control (cwnd)", "Flow control (rwnd)", "TIME_WAIT", "Nagle's algorithm"],
        answer: 1,
        explanation: "The receiver advertises a shrinking (eventually zero) receive window; the sender must not exceed it.",
      },
      {
        id: "tcp-q2",
        prompt: "Over one TCP connection, a client sends `write(\"AB\")` then `write(\"CD\")`. What can the server's reads return?",
        options: ["Exactly \"AB\" then \"CD\"", "Any split of \"ABCD\" in order, e.g. \"ABCD\" or \"A\",\"BCD\"", "\"CD\" before \"AB\" if packets reorder", "Either \"AB\" or \"CD\", never both"],
        answer: 1,
        explanation: "TCP is an ordered byte stream without message boundaries: bytes arrive in order, but read boundaries are arbitrary.",
      },
      {
        id: "tcp-q3",
        prompt: "Which side of a TCP connection enters TIME_WAIT?",
        options: ["Always the server", "Always the client", "The side that sends the first FIN (active close)", "Both sides"],
        answer: 2,
        explanation: "The active closer waits 2×MSL so stray segments from the old connection expire and it can re-ACK a retransmitted FIN.",
      },
    ],
  },

  // ───────────────────────────── udp (outline) ─────────────────────────────
  {
    slug: "udp",
    track: "networks",
    title: "UDP: datagrams without guarantees",
    summary:
      "UDP adds only ports and a checksum to IP: no handshake, no ordering, no retransmission, no congestion control. Learn why DNS, games, VoIP, video and QUIC build on it anyway.",
    level: "beginner",
    frequency: "high",
    minutes: 15,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["networks/osi-tcp-ip", "networks/tcp"],
    related: ["networks/dns", "networks/http", "networks/streaming-protocols"],
    tags: ["udp", "datagram", "quic"],
    sources: [rfc(768, "User Datagram Protocol"), rfc(9000, "QUIC: A UDP-Based Multiplexed and Secure Transport"), zineNet],
    questions: ["networks/net-02"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Describe what UDP provides (ports, length, checksum, message boundaries) and what it doesn't",
              "Compare TCP and UDP for latency, reliability, ordering and connection state",
              "Explain why QUIC (HTTP/3) is built on UDP rather than as a new kernel protocol",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "The 8-byte UDP header and datagram semantics: each send is one message, which may be lost, duplicated or reordered.",
              "Use cases: DNS, DHCP, real-time media (RTP), games, telemetry, QUIC.",
              "Responsibilities pushed to the application: retries, ordering, congestion control, fragmentation limits (MTU).",
              "TCP vs UDP comparison table for interviews.",
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── tls-handshake ─────────────────────────────
  {
    slug: "tls-handshake",
    track: "networks",
    title: "TLS 1.3 handshake and the chain of trust",
    summary:
      "How a client and server agree on keys in one round trip with TLS 1.3, how the server proves its identity with a certificate chain, what SNI is for, and why 0-RTT data can be replayed.",
    level: "intermediate",
    frequency: "high",
    minutes: 40,
    kinds: ["theory", "visualization"],
    status: "authored",
    prerequisites: ["networks/tcp"],
    related: ["networks/http", "networks/ingress-routing", "system-design/dns-tcp-lb-firewalls", "backend/authentication-jwt-sessions"],
    tags: ["tls", "https", "certificates", "pki", "sni", "0-rtt", "ecdhe"],
    sources: [
      rfc(8446, "The Transport Layer Security (TLS) Protocol Version 1.3"),
      { label: "RFC 5280 — X.509 Public Key Infrastructure Certificate and CRL Profile", url: "https://www.rfc-editor.org/rfc/rfc5280", kind: "docs" },
      { label: "The Illustrated TLS 1.3 Connection", url: "https://tls13.xargs.org/", kind: "external" },
      { label: "High Performance Browser Networking — Transport Layer Security", url: "https://hpbn.co/transport-layer-security-tls/", kind: "external" },
      note100x,
    ],
    questions: ["networks/net-05", "networks/net-01"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "List the TLS 1.3 handshake messages in order and explain what each achieves",
              "Explain why TLS 1.3 needs 1 RTT where TLS 1.2 needed 2",
              "Describe how a certificate chain is validated up to a trusted root",
              "Explain SNI, session resumption and the replay risk of 0-RTT data",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "TLS solves two problems at once: *who am I talking to?* (authentication) and *how do we talk privately?* (key agreement). The client and server each contribute half of a secret using Diffie–Hellman, so even someone recording all traffic can't compute the key. The server then signs the conversation with the private key matching a certificate that someone the client already trusts has vouched for.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**TLS** (Transport Layer Security, RFC 8446 for v1.3) provides confidentiality, integrity and server (optionally client) authentication on top of a reliable transport such as TCP. HTTPS is HTTP over TLS. A **certificate** (X.509) binds a public key to names (e.g. `api.example.com`) and is signed by a **certificate authority (CA)**.",
          },
          {
            type: "table",
            head: ["Message (TLS 1.3)", "From", "Purpose"],
            rows: [
              ["ClientHello", "Client", "Supported versions & cipher suites, random, **key_share** (client's ephemeral DH public key, e.g. X25519), SNI, ALPN (`h2`, `http/1.1`)"],
              ["ServerHello", "Server", "Chosen cipher suite + server's key_share. Both sides now derive handshake keys — everything after is encrypted"],
              ["EncryptedExtensions", "Server", "Remaining negotiated parameters (e.g. ALPN result)"],
              ["Certificate", "Server", "The server's certificate chain (leaf + intermediates)"],
              ["CertificateVerify", "Server", "Signature over the handshake transcript with the certificate's private key — proves possession of the key"],
              ["Finished", "Server, then client", "MAC over the whole transcript — proves nobody tampered with the handshake"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Every HTTPS request pays for the TLS handshake on a new connection — it's a major part of time-to-first-byte.",
              "Misconfigured certificates (missing intermediates, wrong names, expiry) are a classic outage cause.",
              "Load balancers and ingress controllers terminate TLS, so you need to know where encryption starts and ends.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "**Why 1 RTT.** In TLS 1.3 the client *guesses* the key-exchange group and sends its key share in the very first message. The server can therefore compute the shared secret immediately and reply with its share, certificate, proof and Finished in one flight. The client verifies, sends its Finished and can send application data right away — 1 RTT after TCP is set up. (If the guess was wrong, a HelloRetryRequest costs an extra round trip.)",
          },
          {
            type: "compare",
            items: [
              {
                title: "TLS 1.2 (full handshake: 2 RTT)",
                points: [
                  "ClientHello → ServerHello, Certificate, ServerKeyExchange, ServerHelloDone",
                  "ClientKeyExchange, ChangeCipherSpec, Finished → ChangeCipherSpec, Finished",
                  "Certificate sent in plaintext",
                  "Allowed RSA key transport (no forward secrecy) and many legacy ciphers",
                ],
              },
              {
                title: "TLS 1.3 (full handshake: 1 RTT)",
                points: [
                  "Key share sent in ClientHello",
                  "Everything after ServerHello encrypted, including the certificate",
                  "Only ephemeral (EC)DHE key exchange → forward secrecy always",
                  "Small set of AEAD ciphers (AES-GCM, ChaCha20-Poly1305)",
                ],
              },
            ],
          },
          {
            type: "p",
            text: "**Chain of trust.** The server sends its leaf certificate plus intermediate CA certificates. The client checks each signature up the chain until it reaches a **root CA** in its trust store (shipped by the OS or browser). It also checks validity dates, that the hostname matches a Subject Alternative Name, key usage constraints and (in various ways) revocation.",
          },
          {
            type: "flow",
            nodes: ["Leaf: api.example.com", "Intermediate CA", "Root CA (in trust store)"],
            caption: "Conceptual chain: each certificate is signed by the one to its right; the root is self-signed and trusted because it's preinstalled.",
          },
          {
            type: "p",
            text: "**SNI** (Server Name Indication) puts the hostname in the ClientHello so one IP can host many certificates. It is sent in plaintext in TLS 1.3 too (Encrypted Client Hello is the emerging fix). **ALPN** in the same message negotiates HTTP/2 vs HTTP/1.1 without an extra round trip.",
          },
          {
            type: "p",
            text: "**Resumption and 0-RTT.** After a handshake the server can issue a session ticket (a pre-shared key). A returning client can resume with less work, and may send **early data (0-RTT)** in its first flight. Early data is not protected against **replay** — an attacker can resend it — so servers should only accept it for idempotent requests (e.g. `GET`).",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Revocation and 0-RTT are deployment choices",
            text: "Revocation checking differs widely: browsers use their own pushed revocation lists or OCSP stapling, and many clients soft-fail. Whether 0-RTT is enabled at all is a server/CDN configuration choice, and TLS libraries differ in which key-share groups they guess first (commonly X25519, increasingly hybrid post-quantum groups).",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "TCP handshake done", detail: "1 RTT spent. Now TLS starts on the connected socket." },
              { title: "ClientHello", detail: "Client sends random, cipher suites, `supported_versions: TLS 1.3`, key_share (X25519 public key), SNI `api.example.com`, ALPN `[h2, http/1.1]`." },
              { title: "ServerHello + key derivation", detail: "Server picks a suite and sends its key_share. Both compute the ECDHE shared secret and derive handshake traffic keys via HKDF." },
              { title: "Encrypted server flight", detail: "EncryptedExtensions (ALPN = h2), Certificate (leaf + intermediate), CertificateVerify (signature over the transcript), Finished." },
              { title: "Client verifies", detail: "Validates the chain to a trusted root, the hostname, dates; checks the signature and Finished MAC. Any failure → alert, connection closed." },
              { title: "Client Finished + data", detail: "Client sends Finished and immediately its first HTTP request, encrypted with application keys. Total: 1 TCP RTT + 1 TLS RTT before the request leaves." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "sys-request-flow", caption: "TLS comes right after the TCP connect — often terminated at the load balancer rather than the app." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "bash",
            code: `# Inspect the handshake and certificate chain
openssl s_client -connect example.com:443 -servername example.com -tls1_3 </dev/null 2>/dev/null \\
  | grep -E "Protocol|Cipher|subject=|issuer="

# Timing breakdown: DNS, TCP connect, TLS done, first byte
curl -so /dev/null -w "dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer}\\n" https://example.com`,
            caption: "Illustrative — output format depends on OpenSSL/curl versions; timings vary by network.",
            output: `dns=0.012 tcp=0.041 tls=0.075 ttfb=0.112`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          { type: "callout", tone: "misconception", title: "\"The certificate encrypts the traffic\"", text: "Traffic is encrypted with symmetric keys derived from the ephemeral Diffie–Hellman exchange. The certificate's key only *signs* the handshake to prove identity." },
          { type: "callout", tone: "misconception", title: "\"HTTPS hides which site I visit\"", text: "The destination IP is visible, and SNI is plaintext unless Encrypted Client Hello is used. Paths, headers and bodies are encrypted." },
          { type: "callout", tone: "warning", title: "Missing intermediate certificate", text: "Browsers may cope (cached intermediates, AIA fetching) while `curl`, Node or Java clients fail. Always serve the full chain (leaf + intermediates)." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Choice", "Benefit", "Cost"],
            rows: [
              ["Terminate TLS at the load balancer", "Centralised certs, L7 routing, offloads crypto", "Traffic inside the network is plaintext unless re-encrypted"],
              ["End-to-end / mTLS to services", "Encryption and identity everywhere (zero trust)", "Certificate distribution and rotation complexity"],
              ["Enable 0-RTT", "Saves a round trip for returning clients", "Replay risk; restrict to idempotent requests"],
              ["Short-lived certs (e.g. 90 days, automated)", "Smaller window if keys leak", "Requires reliable automation (ACME)"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "In TLS 1.3 the client sends a ClientHello with its supported ciphers, SNI, ALPN and an ephemeral Diffie–Hellman key share. The server answers with ServerHello and its key share — now both derive the same secret — then sends, encrypted, its certificate chain, a CertificateVerify signature over the transcript and Finished. The client validates the chain up to a trusted root and the hostname, sends Finished, and starts sending data: one round trip, versus two for TLS 1.2. Resumption can allow 0-RTT data, which is replayable, so only for idempotent requests.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Forward secrecy: because keys come from ephemeral DH, stealing the server's private key later doesn't decrypt recorded sessions.",
              "Explain CertificateVerify vs Finished: one proves key possession (identity), the other proves transcript integrity.",
              "Full HTTPS cold start cost: DNS + 1 RTT TCP + 1 RTT TLS 1.3 before the request; QUIC merges transport and TLS into 1 RTT total.",
              "mTLS: the server sends CertificateRequest and the client authenticates with its own certificate — common between microservices.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Key share in ClientHello → 1-RTT handshake; everything after ServerHello is encrypted.",
              "Certificate + CertificateVerify authenticate the server; Finished protects the transcript.",
              "Chain of trust: leaf → intermediates → root in the client's trust store; hostname must match SAN.",
              "SNI selects the cert; ALPN picks the HTTP version; 0-RTT is fast but replayable.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "TLS", definition: "Transport Layer Security: protocol providing encryption, integrity and authentication over a reliable transport." },
      { term: "ECDHE", definition: "Ephemeral elliptic-curve Diffie–Hellman: each side contributes a one-time key pair to agree on a shared secret." },
      { term: "Forward secrecy", definition: "Compromise of long-term keys doesn't reveal past session keys." },
      { term: "Certificate authority (CA)", definition: "An entity trusted to sign certificates binding public keys to names." },
      { term: "Trust store", definition: "The set of root CA certificates an OS, browser or runtime trusts." },
      { term: "SAN", definition: "Subject Alternative Name: the certificate field listing the hostnames it is valid for." },
      { term: "SNI", definition: "Server Name Indication: hostname sent in the ClientHello so the server can pick the right certificate." },
      { term: "ALPN", definition: "Application-Layer Protocol Negotiation: TLS extension to agree on h2 / http/1.1 during the handshake." },
      { term: "0-RTT (early data)", definition: "Application data sent in the first flight of a resumed TLS 1.3 connection; not replay-protected." },
    ],
    followUps: [
      { q: "If the attacker records traffic and later steals the server's private key, can they decrypt it?", a: "Not with TLS 1.3: session keys come from ephemeral (EC)DHE shares that are discarded, so the long-term key only enables impersonation going forward, not decryption of past sessions." },
      { q: "What does the client check when validating a certificate?", a: "Signatures up the chain to a trusted root, validity period, that the requested hostname matches a SAN entry, key usage/basic constraints, and revocation status per its policy." },
      { q: "Why is 0-RTT data dangerous?", a: "It's encrypted with keys from a previous session and can be captured and replayed by an attacker; a non-idempotent request (like a payment POST) could execute twice. Servers limit it to safe methods or add anti-replay mechanisms." },
      { q: "How does HTTP/3 reduce handshake latency further?", a: "QUIC integrates the TLS 1.3 handshake into its own transport handshake, so a new connection needs 1 RTT total instead of TCP's 1 RTT plus TLS's 1 RTT." },
    ],
    quiz: [
      {
        id: "tls-q1",
        prompt: "Why can TLS 1.3 complete a full handshake in 1 RTT?",
        options: [
          "It skips certificate validation",
          "The client sends its key share in the ClientHello, so the server can derive keys immediately",
          "It reuses the TCP handshake's sequence numbers as keys",
          "It uses RSA key transport",
        ],
        answer: 1,
        explanation: "Guessing the group and sending a key share up front removes the extra round trip TLS 1.2 needed for key exchange.",
      },
      {
        id: "tls-q2",
        prompt: "Which message proves the server holds the private key for its certificate?",
        options: ["ServerHello", "Certificate", "CertificateVerify", "EncryptedExtensions"],
        answer: 2,
        explanation: "CertificateVerify is a signature over the handshake transcript made with the certificate's private key. The Certificate message alone is public data anyone could send.",
      },
      {
        id: "tls-q3",
        prompt: "Which part of an HTTPS connection is still visible to a network observer without Encrypted Client Hello?",
        options: ["The URL path", "Request headers", "The hostname via SNI", "The response body"],
        answer: 2,
        explanation: "SNI travels in the plaintext ClientHello; paths, headers and bodies are encrypted.",
      },
    ],
  },

  // ───────────────────────────── http ─────────────────────────────
  {
    slug: "http",
    track: "networks",
    title: "HTTP semantics and HTTP/1.1 → HTTP/2 → HTTP/3",
    summary:
      "HTTP's semantics (methods, status codes, headers) stay the same across versions; what changes is the wire format and transport. Learn keep-alive and HOL blocking in 1.1, multiplexing and HPACK in HTTP/2, and HTTP/3 over QUIC.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 50,
    kinds: ["theory", "visualization"],
    status: "authored",
    prerequisites: ["networks/tcp", "networks/tls-handshake"],
    related: ["networks/http-caching", "networks/cors", "networks/websockets", "networks/curl-debugging", "networks/udp", "javascript/fetch-http", "system-design/rest-api-design", "system-design/api-idempotency"],
    tags: ["http", "http2", "http3", "quic", "keep-alive", "multiplexing", "hpack", "head-of-line-blocking"],
    sources: [
      rfc(9110, "HTTP Semantics"),
      rfc(9112, "HTTP/1.1"),
      rfc(9113, "HTTP/2"),
      rfc(9114, "HTTP/3"),
      rfc(9000, "QUIC: A UDP-Based Multiplexed and Secure Transport"),
      { label: "RFC 7541 — HPACK: Header Compression for HTTP/2", url: "https://www.rfc-editor.org/rfc/rfc7541", kind: "docs" },
      { label: "RFC 9204 — QPACK: Field Compression for HTTP/3", url: "https://www.rfc-editor.org/rfc/rfc9204", kind: "docs" },
      zineHttp,
      hpbn,
      note100x,
    ],
    questions: ["networks/net-03", "networks/net-01"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Read and write a raw HTTP/1.1 request and response",
              "Use method semantics correctly: safe, idempotent, cacheable",
              "Explain keep-alive, pipelining and HTTP/1.1 head-of-line blocking",
              "Explain HTTP/2 binary framing, streams, multiplexing and HPACK, and why TCP HOL blocking remains",
              "Explain what HTTP/3 and QUIC change: UDP, per-stream ordering, integrated TLS, QPACK, connection migration, 0-RTT",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "HTTP is a request/response conversation: \"`GET /users/42`, please\" → \"`200 OK`, here it is\". The *meaning* of that conversation (RFC 9110) hasn't changed since the 1990s. What has changed is how efficiently it's packed onto the wire: from one-at-a-time text lines, to interleaved binary frames, to frames carried over a new transport that doesn't stall everything when one packet is lost.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "An HTTP **message** has a start line (request: method + target; response: status), **header fields**, and an optional **body**. **Methods** carry semantics: *safe* methods (GET, HEAD, OPTIONS) shouldn't change server state; *idempotent* methods (safe ones plus PUT, DELETE) can be repeated with the same effect; POST and PATCH are neither by default.",
          },
          {
            type: "table",
            head: ["Status class", "Meaning", "Examples"],
            rows: [
              ["1xx", "Informational", "101 Switching Protocols, 103 Early Hints"],
              ["2xx", "Success", "200 OK, 201 Created, 204 No Content"],
              ["3xx", "Redirection / cached", "301, 302, 304 Not Modified, 307, 308"],
              ["4xx", "Client error", "400, 401 (not authenticated), 403 (not allowed), 404, 409, 429"],
              ["5xx", "Server error", "500, 502 Bad Gateway, 503, 504 Gateway Timeout"],
            ],
          },
          {
            type: "code",
            lang: "http",
            code: `GET /users/42 HTTP/1.1
Host: api.example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 27
Cache-Control: max-age=60

{"id":42,"name":"Ada Byte"}`,
            caption: "An HTTP/1.1 exchange. Lines end with CRLF; a blank line separates headers from the body. Content-Length counts body bytes (27 here).",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Every API you build or call speaks HTTP; status codes, idempotency and caching are interview staples.",
              "Version differences explain real performance behaviour: domain sharding and bundling were HTTP/1.1 workarounds; HTTP/2 made many of them counterproductive.",
              "Proxies, load balancers and CDNs often speak different versions on each side (h2 to the client, HTTP/1.1 to the origin).",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "**HTTP/1.1** is text over TCP. Connections are **persistent (keep-alive) by default**, so several requests reuse one TCP+TLS connection. But a connection carries one response at a time in order: **pipelining** (sending several requests without waiting) requires responses in request order, so one slow response blocks the rest — application-level head-of-line blocking — and pipelining was never reliably deployed. Browsers instead open about six parallel connections per origin.",
          },
          {
            type: "p",
            text: "**HTTP/2** (RFC 9113) keeps the semantics but uses a **binary framing layer**. Each request/response is a **stream** with an ID; its HEADERS and DATA **frames** are interleaved with other streams' frames on a single connection (**multiplexing**). Headers are compressed with **HPACK** (static + dynamic tables, Huffman coding), which matters because headers repeat on every request. Per-stream flow control and prioritisation exist too.",
          },
          {
            type: "p",
            text: "HTTP/2 removes HTTP-level HOL blocking but not **TCP-level HOL blocking**: all streams share one TCP byte stream, so one lost packet stalls every stream until it's retransmitted. On lossy networks HTTP/2 over one connection can perform worse than HTTP/1.1's six.",
          },
          {
            type: "p",
            text: "**HTTP/3** (RFC 9114) maps HTTP onto **QUIC** (RFC 9000), a transport running over UDP in user space. QUIC provides streams natively with **per-stream ordering** (a loss stalls only the affected stream), integrates **TLS 1.3** into its handshake (1 RTT for a new connection, 0-RTT on resumption), identifies connections by **connection IDs** so they survive IP changes (Wi-Fi → mobile), and encrypts almost all transport headers. Header compression is **QPACK**, redesigned because HPACK assumed in-order delivery.",
          },
          {
            type: "table",
            head: ["", "HTTP/1.1", "HTTP/2", "HTTP/3"],
            rows: [
              ["Transport", "TCP (+TLS)", "TCP + TLS (h2)", "QUIC over UDP (TLS 1.3 built in)"],
              ["Format", "Text", "Binary frames", "Binary frames on QUIC streams"],
              ["Concurrency per connection", "One in-flight response", "Many multiplexed streams", "Many independent streams"],
              ["HOL blocking", "HTTP-level and TCP-level", "TCP-level only", "Per stream only"],
              ["Header compression", "None", "HPACK", "QPACK"],
              ["New connection setup (HTTPS)", "TCP 1 RTT + TLS 1 RTT", "TCP 1 RTT + TLS 1 RTT", "1 RTT (0-RTT resumed)"],
              ["Discovery", "—", "ALPN `h2` in TLS", "`Alt-Svc` header or DNS HTTPS record, then ALPN `h3`"],
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Deployment details vary",
            text: "HTTP/2 server push is specified but has been removed from major browsers (Chrome dropped it in 2022); `103 Early Hints` is the common replacement. The \"six connections per origin\" limit for HTTP/1.1 is a browser convention, not part of the spec. Some networks block or throttle UDP, so browsers race or fall back from HTTP/3 to HTTP/2.",
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Browser needs 3 resources", detail: "`/app.js`, `/style.css`, `/logo.png` from the same origin, over a fresh HTTPS connection." },
              { title: "HTTP/1.1", detail: "Opens up to ~6 connections (each with TCP + TLS handshakes) and sends one request per connection; or queues requests on one keep-alive connection, each waiting for the previous response." },
              { title: "HTTP/2", detail: "One TCP+TLS connection (ALPN `h2`). Sends HEADERS on streams 1, 3, 5 immediately; DATA frames for the three responses interleave. If one TCP packet is lost, all three streams stall until retransmission." },
              { title: "HTTP/3", detail: "One QUIC connection (1 RTT including TLS). Streams 0, 4, 8 proceed independently; a lost packet carrying `logo.png` bytes only delays `logo.png`." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          { type: "viz", id: "sys-request-flow", caption: "HTTP rides on the DNS → TCP → TLS path; HTTP/3 collapses TCP and TLS into one QUIC handshake." },
          { type: "flow", nodes: ["HTTP semantics (RFC 9110)", "HTTP/1.1 text | HTTP/2 frames | HTTP/3 frames", "TCP+TLS | TCP+TLS | QUIC/UDP"], caption: "Conceptual layering: same semantics, three wire mappings." },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "bash",
            code: `curl -sI --http1.1 https://example.com | head -1
curl -sI --http2   https://example.com | head -1
curl -sI --http3   https://cloudflare.com | head -1   # needs a curl built with HTTP/3`,
            caption: "Illustrative — depends on the server and your curl build.",
            output: `HTTP/1.1 200 OK
HTTP/2 200
HTTP/3 301`,
          },
          {
            type: "code",
            lang: "js",
            code: `// Idempotency in practice: which requests are safe to retry automatically?
const methods = ["GET", "HEAD", "PUT", "DELETE", "POST", "PATCH"];
const idempotent = new Set(["GET", "HEAD", "OPTIONS", "TRACE", "PUT", "DELETE"]);
for (const m of methods) {
  console.log(m.padEnd(6), idempotent.has(m) ? "retry ok" : "needs idempotency key");
}`,
            runnable: true,
            output: `GET    retry ok
HEAD   retry ok
PUT    retry ok
DELETE retry ok
POST   needs idempotency key
PATCH  needs idempotency key`,
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          { type: "callout", tone: "misconception", title: "\"HTTP/2 fixed head-of-line blocking\"", text: "It fixed HOL blocking at the HTTP layer. TCP still delivers bytes in order, so packet loss stalls all streams. HTTP/3/QUIC is what removes transport-level HOL blocking." },
          { type: "callout", tone: "misconception", title: "\"PUT and POST are interchangeable\"", text: "PUT replaces the resource at a known URI and is idempotent; POST asks the server to process data (often creating a resource at a server-chosen URI) and isn't idempotent." },
          { type: "callout", tone: "warning", title: "Keep HTTP/1.1 optimisations out of HTTP/2", text: "Domain sharding defeats HTTP/2's single connection and HPACK context; aggressive bundling hurts cache granularity. Measure before carrying old hacks forward." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Version", "Strength", "Weakness"],
            rows: [
              ["HTTP/1.1", "Simple, debuggable text, universal support", "Needs many connections for parallelism; header overhead"],
              ["HTTP/2", "One connection, multiplexing, header compression", "TCP HOL blocking on lossy links; more complex"],
              ["HTTP/3", "No transport HOL, faster setup, connection migration", "UDP may be blocked; higher CPU cost in user space; tooling still maturing"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "HTTP semantics — methods, status codes, headers — are shared by all versions. HTTP/1.1 is text over TCP with persistent connections, but one response at a time per connection, so browsers open several connections. HTTP/2 uses binary frames and multiplexes many streams over one TCP connection with HPACK header compression, but a lost TCP packet still blocks every stream. HTTP/3 runs over QUIC on UDP: per-stream ordering removes that blocking, TLS 1.3 is built into a 1-RTT handshake, and connections survive network changes.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain safe vs idempotent and connect it to retries and 0-RTT.",
              "Explain why QPACK exists: HPACK's dynamic table updates assume in-order delivery, which QUIC streams don't guarantee.",
              "Discuss how clients discover HTTP/3 (`Alt-Svc`, DNS HTTPS records) and fall back.",
              "Mention that a reverse proxy may speak h2/h3 to clients and HTTP/1.1 to upstreams — performance features stop at the proxy.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Semantics (RFC 9110) are version-independent: methods, status codes, headers, caching.",
              "1.1: text, keep-alive, one response at a time per connection.",
              "2: binary frames, multiplexed streams, HPACK; TCP HOL remains.",
              "3: QUIC over UDP, per-stream ordering, integrated TLS 1.3, QPACK, connection migration.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Keep-alive (persistent connection)", definition: "Reusing one TCP connection for multiple HTTP requests; default in HTTP/1.1." },
      { term: "Pipelining", definition: "Sending multiple HTTP/1.1 requests without waiting for responses; responses must still come back in order." },
      { term: "Stream", definition: "In HTTP/2 and QUIC, an independent bidirectional sequence of frames carrying one request/response." },
      { term: "Frame", definition: "The unit of HTTP/2 and HTTP/3 communication (HEADERS, DATA, SETTINGS…)." },
      { term: "Multiplexing", definition: "Interleaving several streams over one connection." },
      { term: "HPACK / QPACK", definition: "Header compression schemes for HTTP/2 and HTTP/3 respectively." },
      { term: "QUIC", definition: "A UDP-based, encrypted, multiplexed transport protocol (RFC 9000) used by HTTP/3." },
      { term: "Idempotent", definition: "Repeating the request has the same effect on the server as doing it once." },
    ],
    followUps: [
      { q: "Why does HTTP/3 use UDP instead of a new transport protocol?", a: "New IP protocols are routinely blocked by middleboxes and kernel TCP stacks are slow to evolve. UDP passes through most networks and lets QUIC be implemented and updated in user space." },
      { q: "What's the difference between 401 and 403?", a: "401 means the request lacks valid authentication (send credentials); 403 means the server understood who you are (or doesn't care) and refuses access." },
      { q: "Is HTTP/2 always faster than HTTP/1.1?", a: "Usually on good networks thanks to one warm connection and header compression, but with high packet loss the single TCP connection's HOL blocking can make it slower than several HTTP/1.1 connections." },
      { q: "How does a client know a server supports HTTP/2?", a: "Via ALPN during the TLS handshake: the client offers `h2` and `http/1.1`, and the server picks one." },
    ],
    quiz: [
      {
        id: "http-q1",
        prompt: "Which problem does HTTP/2 NOT solve?",
        options: ["Header overhead on every request", "One response at a time per connection", "Stalling all streams when a TCP packet is lost", "Needing many connections for parallelism"],
        answer: 2,
        explanation: "HTTP/2 still runs over a single TCP byte stream, so packet loss blocks all multiplexed streams until retransmission.",
      },
      {
        id: "http-q2",
        prompt: "Which methods are idempotent according to HTTP semantics?",
        options: ["GET and POST", "PUT and DELETE", "POST and PATCH", "Only GET"],
        answer: 1,
        explanation: "PUT and DELETE (plus the safe methods GET, HEAD, OPTIONS, TRACE) are idempotent; POST and PATCH aren't by default.",
      },
      {
        id: "http-q3",
        prompt: "Why did HTTP/3 need QPACK instead of HPACK?",
        options: [
          "HPACK is not secure",
          "HPACK relies on headers arriving in order, but QUIC streams are delivered independently",
          "QPACK compresses bodies too",
          "HTTP/3 has no headers",
        ],
        answer: 1,
        explanation: "HPACK's dynamic table updates assume a single ordered stream; with independent QUIC streams that would reintroduce HOL blocking, so QPACK handles table updates differently.",
      },
    ],
  },

  // ───────────────────────────── websockets ─────────────────────────────
  {
    slug: "websockets",
    track: "networks",
    title: "WebSockets: the Upgrade handshake and full-duplex messaging",
    summary:
      "A WebSocket starts life as an HTTP/1.1 request with `Upgrade: websocket`, then the same TCP connection switches to a framed, full-duplex message protocol (RFC 6455).",
    level: "intermediate",
    frequency: "high",
    minutes: 20,
    kinds: ["theory"],
    status: "authored",
    prerequisites: ["networks/http", "networks/tcp"],
    related: ["networks/http", "networks/ingress-routing", "system-design/load-balancing-algorithms"],
    tags: ["websocket", "upgrade", "real-time", "full-duplex"],
    sources: [
      rfc(6455, "The WebSocket Protocol"),
      { label: "RFC 8441 — Bootstrapping WebSockets with HTTP/2", url: "https://www.rfc-editor.org/rfc/rfc8441", kind: "docs" },
      { label: "MDN — The WebSocket API", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Read the HTTP Upgrade handshake and explain `Sec-WebSocket-Key` / `Sec-WebSocket-Accept`",
              "Know what WebSocket frames add over raw TCP (message boundaries, opcodes, masking, ping/pong, close)",
              "Choose between WebSockets, Server-Sent Events and long polling",
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "A **WebSocket** is a persistent, full-duplex, message-oriented channel between browser and server over a single TCP connection (`ws://` or, over TLS, `wss://`). It begins with an ordinary HTTP/1.1 GET that asks to switch protocols; after a `101 Switching Protocols` response both sides exchange **frames** instead of HTTP messages.",
          },
          {
            type: "code",
            lang: "http",
            code: `GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: https://app.example.com

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`,
            caption: "The handshake example from RFC 6455. Accept = base64(SHA-1(key + \"258EAFA5-E914-47DA-95CA-C5AB0DC85B11\")).",
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "list",
            items: [
              "`Sec-WebSocket-Accept` proves the server understood the WebSocket handshake (not a confused HTTP server or cache). It is **not** authentication or security.",
              "Frames carry an opcode (text, binary, close, ping, pong, continuation), a FIN bit for fragmented messages, and a payload length.",
              "Client-to-server frames are **masked** with a random 4-byte key to stop cache-poisoning attacks on intermediaries.",
              "The browser sends `Origin`, but CORS does not apply — servers must check `Origin` themselves to prevent cross-site WebSocket hijacking.",
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Proxies and idle timeouts",
            text: "Load balancers and reverse proxies must be configured to pass the Upgrade (e.g. nginx `proxy_set_header Upgrade` / `Connection`) and usually close idle connections after their own timeout (often 60 s), so applications send ping/pong heartbeats. WebSockets over HTTP/2 (RFC 8441) exist but support varies.",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Option", "Direction", "Good for", "Watch out for"],
            rows: [
              ["WebSocket", "Bi-directional", "Chat, collaboration, games, live trading", "Stateful connections: sticky routing, scaling fan-out (pub/sub), reconnection logic"],
              ["Server-Sent Events", "Server → client", "Notifications, live feeds, LLM token streaming", "Text only; one-way; HTTP/1.1 connection limits"],
              ["Long polling", "Simulated push", "Fallback, very simple infra", "Latency and request overhead"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A WebSocket upgrades an HTTP/1.1 connection: the client sends `Upgrade: websocket` with a random `Sec-WebSocket-Key`, the server answers `101 Switching Protocols` with `Sec-WebSocket-Accept` derived from that key, and from then on the TCP connection carries framed, full-duplex messages. It's ideal for low-latency two-way traffic, but connections are long-lived and stateful, so scaling needs sticky routing or a pub/sub backbone and heartbeats to survive idle timeouts.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "HTTP GET + Upgrade → 101 → frames on the same TCP connection.",
              "Accept header = handshake sanity check, not security; check `Origin` and authenticate yourself.",
              "Frames give message boundaries, ping/pong and close; client frames are masked.",
              "Consider SSE when you only need server → client.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "101 Switching Protocols", definition: "HTTP status telling the client the connection now speaks the protocol named in `Upgrade`." },
      { term: "Masking", definition: "XOR-ing client frame payloads with a random key to prevent intermediary cache-poisoning attacks." },
      { term: "SSE", definition: "Server-Sent Events: a one-way server-to-client stream over a long-lived HTTP response (`text/event-stream`)." },
    ],
    followUps: [
      { q: "Does CORS protect WebSocket endpoints?", a: "No. Browsers don't apply CORS to WebSocket handshakes. The server must validate the `Origin` header and authenticate (cookie, token) itself." },
      { q: "How do you scale WebSockets horizontally?", a: "Each connection lives on one server, so use a load balancer that supports long-lived connections, keep per-connection state small, and fan out messages across servers through pub/sub (Redis, NATS, Kafka)." },
    ],
    quiz: [
      {
        id: "ws-q1",
        prompt: "What does `Sec-WebSocket-Accept` prove?",
        options: ["The user is authenticated", "The server understood the WebSocket handshake for this specific request", "The connection is encrypted", "CORS succeeded"],
        answer: 1,
        explanation: "It's derived from the client's random key with a fixed GUID, so a server that returns it must have processed the WebSocket handshake. It offers no authentication or encryption.",
      },
      {
        id: "ws-q2",
        prompt: "Which status code completes a successful WebSocket handshake?",
        options: ["200", "101", "204", "426"],
        answer: 1,
        explanation: "`101 Switching Protocols`. (426 Upgrade Required is what a server might send when the client *should* upgrade.)",
      },
    ],
  },

  // ───────────────────────────── cors ─────────────────────────────
  {
    slug: "cors",
    track: "networks",
    title: "CORS and the same-origin policy",
    summary:
      "The browser's same-origin policy blocks scripts from reading cross-origin responses; CORS is the header-based protocol that lets servers relax it. Learn simple vs preflighted requests, the Access-Control-* headers, credentials, and why CORS is not server-side security.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 35,
    kinds: ["theory"],
    status: "authored",
    prerequisites: ["networks/http"],
    related: ["networks/http", "networks/http-caching", "javascript/fetch-http", "backend/csrf", "system-design/authn-authz"],
    tags: ["cors", "same-origin-policy", "preflight", "browser-security", "options"],
    sources: [
      mdnCors,
      { label: "WHATWG Fetch Standard — CORS protocol", url: "https://fetch.spec.whatwg.org/#http-cors-protocol", kind: "docs" },
      { label: "MDN — Same-origin policy", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy", kind: "docs" },
      note100x,
    ],
    questions: ["networks/net-04"],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define an origin and what the same-origin policy restricts",
              "Predict when a request is \"simple\" and when the browser sends a preflight `OPTIONS`",
              "Configure `Access-Control-Allow-*` headers correctly, including credentials",
              "Explain why CORS doesn't protect your API from non-browser clients and how it relates to CSRF",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Your browser is logged into your bank. If any page you visit could `fetch(\"https://bank.example/accounts\")` and *read* the answer using your cookies, every website could steal your data. So browsers enforce a rule: a script can only read responses from its **own origin** — unless the other origin explicitly says \"this origin may read me\". CORS is how the server says that.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "An **origin** is the triple *(scheme, host, port)*: `https://app.example.com:443`. `http://` vs `https://`, `api.example.com` vs `app.example.com`, or port 3000 vs 8080 are all different origins. The **same-origin policy** stops scripts from reading cross-origin responses (and DOM, storage). **CORS** (Cross-Origin Resource Sharing, defined in the WHATWG Fetch standard) lets a server opt in with response headers.",
          },
          {
            type: "table",
            head: ["Header", "Direction", "Meaning"],
            rows: [
              ["`Origin`", "Request", "Origin of the calling page (set by the browser, not by scripts)"],
              ["`Access-Control-Allow-Origin`", "Response", "Which origin may read the response: a single origin or `*`"],
              ["`Access-Control-Allow-Credentials: true`", "Response", "Response may be exposed when the request included cookies/HTTP auth"],
              ["`Access-Control-Request-Method` / `-Headers`", "Preflight request", "What the real request will use"],
              ["`Access-Control-Allow-Methods` / `-Headers`", "Preflight response", "What the server permits"],
              ["`Access-Control-Max-Age`", "Preflight response", "How long the browser may cache the preflight result"],
              ["`Access-Control-Expose-Headers`", "Response", "Non-safelisted response headers scripts may read"],
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Every SPA calling an API on another subdomain or port hits CORS.",
              "\"CORS error\" is one of the most common front-end debugging tickets — understanding preflight saves hours.",
              "Wrong configurations (reflecting any Origin with credentials) create real vulnerabilities.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "A request is **simple** (no preflight) when the method is GET, HEAD or POST, only CORS-safelisted headers are set (e.g. `Accept`, `Content-Language`, `Content-Type`), and `Content-Type`, if present, is `application/x-www-form-urlencoded`, `multipart/form-data` or `text/plain`. These are requests an HTML form could already send, so allowing them to be *sent* adds no new risk; the browser sends it and only checks the response headers before letting the script read it.",
          },
          {
            type: "p",
            text: "Anything else — `PUT`/`DELETE`/`PATCH`, `Content-Type: application/json`, an `Authorization` header, custom headers — triggers a **preflight**: an `OPTIONS` request with `Access-Control-Request-Method` and `-Headers`. Only if the response permits them does the browser send the real request.",
          },
          {
            type: "steps",
            steps: [
              { title: "Script calls fetch", detail: "`fetch(\"https://api.example.com/items\", { method: \"PUT\", headers: { \"Content-Type\": \"application/json\" }, credentials: \"include\" })` from `https://app.example.com`." },
              { title: "Preflight", detail: "Browser sends `OPTIONS /items` with `Origin: https://app.example.com`, `Access-Control-Request-Method: PUT`, `Access-Control-Request-Headers: content-type` (no cookies)." },
              { title: "Preflight response", detail: "Server replies 204 with `Access-Control-Allow-Origin: https://app.example.com`, `Access-Control-Allow-Methods: PUT`, `Access-Control-Allow-Headers: content-type`, `Access-Control-Allow-Credentials: true`, `Access-Control-Max-Age: 600`." },
              { title: "Actual request", detail: "Browser sends the PUT with cookies and `Origin`." },
              { title: "Response check", detail: "Response must again carry a matching `Access-Control-Allow-Origin` (and `Allow-Credentials: true`); otherwise the script gets a network error even though the server processed the request." },
            ],
          },
          {
            type: "p",
            text: "**Credentials rule**: with `credentials: \"include\"`, the server must echo the exact origin — `Access-Control-Allow-Origin: *` is rejected, and so are wildcard `Allow-Headers`/`Allow-Methods`. When echoing the request's Origin dynamically, also send `Vary: Origin` so caches don't serve one origin's CORS headers to another.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Preflight caching limits",
            text: "`Access-Control-Max-Age` is capped by browsers: Chromium caps it at 2 hours and Firefox at 24 hours; without the header the default is 5 seconds. Browsers also add newer checks such as Private Network Access preflights for requests from public sites to private IPs, which are browser-specific.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            code: `// Minimal Express-style CORS middleware with an allowlist
const ALLOWED = new Set(["https://app.example.com", "http://localhost:5173"]);

function cors(req, res, next) {
  const origin = req.headers.origin;
  if (origin && ALLOWED.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // exact origin, not *
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Max-Age", "600");
    return res.status(204).end();
  }
  next();
}`,
            caption: "In real projects use a maintained middleware (e.g. the `cors` package) — but know which headers it sets.",
          },
          {
            type: "code",
            lang: "bash",
            code: `# Reproduce a preflight by hand
curl -i -X OPTIONS https://api.example.com/items \\
  -H "Origin: https://app.example.com" \\
  -H "Access-Control-Request-Method: PUT" \\
  -H "Access-Control-Request-Headers: content-type"`,
            caption: "Illustrative — curl ignores CORS entirely; you're just inspecting the headers the browser would evaluate.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "Preflight requests carry no cookies or Authorization header — auth middleware that rejects unauthenticated `OPTIONS` breaks CORS.",
              "Redirects during a preflight fail; the real request's redirects are handled more permissively but can change the origin to `null`.",
              "`Origin: null` appears for sandboxed iframes and `file://` pages — never allowlist `null`.",
              "`no-cors` mode lets you *send* a simple request but gives an opaque response the script can't read.",
              "Errors (500) without CORS headers show up as CORS errors in the browser console, hiding the real failure.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          { type: "callout", tone: "misconception", title: "\"CORS protects my API\"", text: "CORS is enforced by browsers to protect *users*. curl, servers, mobile apps and attackers' scripts outside a browser ignore it. Protect APIs with authentication, authorization and rate limiting." },
          { type: "callout", tone: "misconception", title: "\"CORS stops the request from reaching the server\"", text: "Simple requests are sent and processed; CORS only stops the script from *reading* the response. That's why state-changing simple POSTs still need CSRF protection." },
          { type: "callout", tone: "warning", title: "Reflecting any Origin with credentials", text: "Echoing whatever `Origin` arrives plus `Allow-Credentials: true` lets any website read authenticated responses. Use an explicit allowlist." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Approach", "Pros", "Cons"],
            rows: [
              ["Same origin via reverse proxy (`/api` on the app's domain)", "No CORS, no preflights, cookies just work", "Requires proxy/ingress routing; couples deployment"],
              ["CORS with allowlist", "Separate API domain, explicit control", "Preflight latency on non-simple requests; config to maintain"],
              ["`Access-Control-Allow-Origin: *`", "Simple for public, unauthenticated data", "Can't be used with credentials"],
              ["Long `Max-Age`", "Fewer preflights", "Policy changes take longer to apply; capped by browsers anyway"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "The same-origin policy stops a page's scripts from reading responses from a different scheme, host or port. CORS lets the server opt in: the browser sends an `Origin` header and only exposes the response if `Access-Control-Allow-Origin` matches. Simple requests (GET/HEAD/POST with form-like content types and safelisted headers) go straight through; anything else, like JSON PUTs or an `Authorization` header, first triggers an `OPTIONS` preflight. With credentials you must return the exact origin, not `*`. And it's a browser protection — it doesn't secure your API from other clients.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Why simple requests skip preflight: HTML forms could always send them, so CORS adds no new capability there.",
              "CORS vs CSRF: CORS controls reading; CSRF is about unwanted *sending* with ambient cookies — mitigate with SameSite cookies and CSRF tokens.",
              "Caching interplay: `Vary: Origin` when responses differ by origin; preflight caching via Max-Age.",
              "Architecture option: put the API behind the same origin (reverse proxy/ingress path routing) to avoid CORS entirely.",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Origin = scheme + host + port; SOP blocks reading cross-origin responses.",
              "Simple requests: sent directly, response checked. Others: OPTIONS preflight first.",
              "Credentials require an exact origin and `Allow-Credentials: true`; add `Vary: Origin`.",
              "CORS is enforced by browsers — not a substitute for auth or CSRF protection.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Origin", definition: "The (scheme, host, port) triple identifying where a document or script came from." },
      { term: "Same-origin policy", definition: "Browser rule preventing scripts from reading data from other origins." },
      { term: "CORS", definition: "Cross-Origin Resource Sharing: HTTP headers that let a server allow specific origins to read its responses." },
      { term: "Preflight", definition: "An automatic `OPTIONS` request the browser sends to check whether a non-simple cross-origin request is allowed." },
      { term: "Simple request", definition: "A cross-origin request a plain HTML form could make; sent without a preflight." },
      { term: "Credentials", definition: "Cookies, HTTP authentication and TLS client certificates attached to a request." },
      { term: "CSRF", definition: "Cross-site request forgery: tricking a browser into sending an authenticated state-changing request." },
    ],
    followUps: [
      { q: "Why do I see a CORS error when the server returned 500?", a: "Error handlers often skip the CORS middleware, so the 500 response lacks `Access-Control-Allow-Origin` and the browser reports a CORS failure instead of exposing the status. Check the network tab or server logs." },
      { q: "Can I just use `*` with cookies?", a: "No. Browsers reject `Access-Control-Allow-Origin: *` on credentialed requests; you must return the specific origin and `Access-Control-Allow-Credentials: true`." },
      { q: "Does a `Content-Type: application/json` POST trigger a preflight?", a: "Yes. Only `application/x-www-form-urlencoded`, `multipart/form-data` and `text/plain` keep a POST simple." },
      { q: "How would you avoid CORS altogether?", a: "Serve the API from the same origin as the front-end, e.g. route `/api/*` through the same domain via a reverse proxy, ingress or CDN path behaviour." },
    ],
    quiz: [
      {
        id: "cors-q1",
        prompt: "Which request from `https://app.example.com` to `https://api.example.com` triggers a preflight?",
        options: [
          "GET with only an `Accept` header",
          "POST with `Content-Type: text/plain`",
          "POST with `Content-Type: application/json`",
          "HEAD with no custom headers",
        ],
        answer: 2,
        explanation: "`application/json` is not a CORS-safelisted content type, so the browser sends an OPTIONS preflight first.",
      },
      {
        id: "cors-q2",
        prompt: "Which pair of origins is the SAME origin?",
        options: [
          "`http://example.com` and `https://example.com`",
          "`https://example.com` and `https://example.com:443/path`",
          "`https://example.com` and `https://www.example.com`",
          "`https://example.com:3000` and `https://example.com:8080`",
        ],
        answer: 1,
        explanation: "443 is the default HTTPS port and the path isn't part of the origin, so scheme, host and port all match.",
      },
      {
        id: "cors-q3",
        prompt: "A malicious server-side script calls your API with curl. What does CORS do?",
        options: ["Blocks the request", "Strips cookies", "Nothing — CORS is enforced by browsers", "Returns 403 automatically"],
        answer: 2,
        explanation: "CORS is a browser mechanism. Non-browser clients ignore it; your API must authenticate and authorise requests itself.",
      },
    ],
  },

  // ───────────────────────────── http-caching ─────────────────────────────
  {
    slug: "http-caching",
    track: "networks",
    title: "HTTP caching: Cache-Control, ETags and revalidation",
    summary:
      "How browsers, CDNs and proxies decide whether a stored response is fresh, when they must revalidate with `ETag`/`If-None-Match` or `Last-Modified`, and the directives (`max-age`, `no-cache`, `no-store`, `private`, `s-maxage`, `immutable`) that control it.",
    level: "intermediate",
    frequency: "high",
    minutes: 25,
    kinds: ["theory"],
    status: "authored",
    prerequisites: ["networks/http"],
    related: ["networks/http", "networks/cors", "system-design/caching-strategies", "system-design/cdn-edge-caching", "cloud/cdn-cloudfront"],
    tags: ["http-caching", "cache-control", "etag", "revalidation", "cdn"],
    sources: [rfc(9111, "HTTP Caching"), mdnCaching, { label: "web.dev — Prevent unnecessary network requests with the HTTP Cache", url: "https://web.dev/articles/http-cache", kind: "external" }],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish freshness (serve from cache without asking) from validation (ask the origin \"has it changed?\")",
              "Use the main `Cache-Control` directives correctly — especially `no-cache` vs `no-store`",
              "Explain strong vs weak ETags and the 304 Not Modified flow",
              "Design a caching policy for HTML, fingerprinted assets and API responses",
            ],
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "An HTTP cache (browser, proxy, CDN) stores responses keyed by method + URL (plus any headers named in `Vary`). A stored response is **fresh** while its age is below its freshness lifetime (`s-maxage` for shared caches, else `max-age`, else `Expires`, else a heuristic). Once **stale**, it must be **revalidated** with a conditional request before reuse (unless directives allow serving stale).",
          },
          {
            type: "table",
            head: ["Directive", "Meaning"],
            rows: [
              ["`max-age=N`", "Fresh for N seconds"],
              ["`s-maxage=N`", "Overrides max-age for shared caches (CDNs, proxies)"],
              ["`no-cache`", "May store, but must revalidate before every reuse"],
              ["`no-store`", "Must not store at all (sensitive data)"],
              ["`private` / `public`", "Only the browser may store / shared caches may store"],
              ["`must-revalidate`", "Once stale, never serve without successful revalidation"],
              ["`immutable`", "Content won't change during freshness — don't revalidate on reload"],
              ["`stale-while-revalidate=N`", "Serve stale for up to N s while revalidating in the background"],
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "First request", detail: "`GET /app.css` → `200 OK`, `Cache-Control: max-age=60`, `ETag: \"v1-abc\"`. Cache stores it with its age." },
              { title: "Within 60 s", detail: "Served from cache — no network request at all." },
              { title: "After 60 s (stale)", detail: "Cache sends `GET /app.css` with `If-None-Match: \"v1-abc\"`." },
              { title: "Unchanged", detail: "Origin replies `304 Not Modified` with no body (plus refreshed headers); the cache resets freshness and serves its copy." },
              { title: "Changed", detail: "Origin replies `200` with the new body and a new ETag; the cache replaces the entry." },
            ],
          },
          {
            type: "p",
            text: "**ETags** are opaque version identifiers. Strong ETags (`\"abc\"`) mean byte-identical; weak ETags (`W/\"abc\"`) mean semantically equivalent. `Last-Modified` + `If-Modified-Since` is the older, second-resolution alternative.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Heuristics and CDN overrides",
            text: "Without explicit freshness, caches may apply a heuristic (commonly 10% of the time since `Last-Modified`). CDNs often let configuration override origin headers, and browser reload behaviour (normal vs hard reload) differs by browser.",
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "table",
            head: ["Resource", "Typical policy", "Why"],
            rows: [
              ["`/assets/app.3f9a1c.js` (fingerprinted)", "`public, max-age=31536000, immutable`", "URL changes when content changes, so cache forever"],
              ["`/index.html`", "`no-cache` (+ ETag)", "Always check for a new version, but 304s are cheap"],
              ["`/api/me` (user data)", "`private, no-store` or `private, max-age=0`", "Never in shared caches; often not cached at all"],
              ["Public API listing", "`public, s-maxage=30, stale-while-revalidate=60`", "CDN absorbs load, short staleness acceptable"],
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          { type: "callout", tone: "misconception", title: "\"`no-cache` means don't cache\"", text: "`no-cache` means *store but always revalidate*. Use `no-store` to forbid storing." },
          { type: "callout", tone: "warning", title: "Forgetting `Vary`", text: "If responses differ by `Accept-Encoding`, `Origin` or auth, say so with `Vary` — otherwise a shared cache may serve one client's variant to another." },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Caches serve a response without contacting the origin while it's fresh, according to `Cache-Control: max-age` (or `s-maxage` for CDNs). When it goes stale, the cache revalidates with a conditional request — `If-None-Match` with the ETag or `If-Modified-Since` — and the origin answers 304 Not Modified if nothing changed. `no-cache` means always revalidate, `no-store` means never store, `private` keeps it out of shared caches. The common pattern is long-lived immutable fingerprinted assets plus a revalidated HTML entry point.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Fresh → serve directly; stale → conditional request → 304 or 200.",
              "`no-cache` ≠ `no-store`; `private` vs `public`; `s-maxage` for shared caches.",
              "Fingerprint static assets and cache them for a year with `immutable`.",
              "Use `Vary` whenever the response depends on request headers.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Freshness lifetime", definition: "How long a stored response may be served without revalidation." },
      { term: "Revalidation", definition: "Asking the origin, via a conditional request, whether a stored response is still valid." },
      { term: "ETag", definition: "An opaque identifier for a specific version of a resource." },
      { term: "304 Not Modified", definition: "Response to a conditional request telling the cache its stored copy is still valid." },
      { term: "Shared cache", definition: "A cache used by many users, such as a CDN or proxy (vs a browser's private cache)." },
    ],
    followUps: [
      { q: "How do you deploy a new front-end version without users getting stale JS?", a: "Fingerprint asset filenames (content hash in the URL) and cache them as immutable; serve `index.html` with `no-cache` so browsers revalidate it and pick up the new asset URLs." },
      { q: "What does `stale-while-revalidate` buy you?", a: "Users get an instant (slightly stale) response while the cache refreshes in the background, hiding origin latency." },
    ],
    quiz: [
      {
        id: "cache-q1",
        prompt: "Which directive stores the response but forces revalidation before each reuse?",
        options: ["`no-store`", "`no-cache`", "`private`", "`immutable`"],
        answer: 1,
        explanation: "`no-cache` allows storage but requires revalidation; `no-store` forbids storage.",
      },
      {
        id: "cache-q2",
        prompt: "A cache revalidates with `If-None-Match: \"v7\"` and the resource hasn't changed. What does the origin send?",
        options: ["200 with the full body", "304 Not Modified without a body", "204 No Content", "412 Precondition Failed"],
        answer: 1,
        explanation: "A matching ETag yields 304 Not Modified, letting the cache reuse its stored body.",
      },
    ],
  },

  // ───────────────────────────── curl-debugging (outline) ─────────────────────────────
  {
    slug: "curl-debugging",
    track: "networks",
    title: "curl and HTTP debugging",
    summary:
      "A practical toolkit for seeing what's really on the wire: `curl -v`, timing breakdowns with `-w`, forcing HTTP versions and resolution, plus `dig`, `openssl s_client`, browser DevTools and packet captures.",
    level: "beginner",
    frequency: "medium",
    minutes: 20,
    kinds: ["coding"],
    status: "outline",
    prerequisites: ["networks/http"],
    related: ["networks/dns", "networks/tls-handshake", "networks/cors", "networks/http-caching", "javascript/fetch-http"],
    tags: ["curl", "debugging", "devtools", "wireshark", "dig"],
    sources: [
      { label: "Everything curl", url: "https://everything.curl.dev/", kind: "docs" },
      { label: "curl man page", url: "https://curl.se/docs/manpage.html", kind: "docs" },
      zineHttp,
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Read `curl -v` output: DNS, connect, TLS, request headers, response headers",
              "Measure latency phases with `curl -w` (namelookup, connect, appconnect, starttransfer, total)",
              "Use `--resolve`, `--http1.1/--http2/--http3`, `-H`, `-X`, `-d`, `--compressed` to reproduce browser requests",
              "Choose the right tool: curl, dig, openssl s_client, DevTools network tab, tcpdump/Wireshark",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Reproducing a failing request: \"Copy as cURL\" from DevTools and trimming it down.",
              "Bypassing DNS to test a specific backend with `--resolve host:443:IP`.",
              "Debugging TLS (certificate chain, SNI) and CORS (simulated preflights) from the command line.",
              "When to drop to packet captures and what they reveal (retransmissions, resets).",
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── streaming-protocols (outline) ─────────────────────────────
  {
    slug: "streaming-protocols",
    track: "networks",
    title: "Streaming protocols: RTMP, HLS and MPEG-DASH",
    summary:
      "How live and on-demand video reaches viewers: RTMP (and SRT/WebRTC) for ingest, then segmented adaptive-bitrate delivery over plain HTTP with HLS and MPEG-DASH, cached by CDNs.",
    level: "intermediate",
    frequency: "low",
    minutes: 25,
    kinds: ["theory", "system-design"],
    status: "outline",
    prerequisites: ["networks/http", "networks/tcp", "networks/udp"],
    related: ["networks/drm-content-protection", "networks/http-caching", "system-design/cdn-edge-caching", "cloud/cdn-cloudfront"],
    tags: ["streaming", "rtmp", "hls", "dash", "abr", "video"],
    sources: [
      rfc(8216, "HTTP Live Streaming"),
      { label: "Apple — HTTP Live Streaming documentation", url: "https://developer.apple.com/streaming/", kind: "docs" },
      { label: "DASH Industry Forum", url: "https://dashif.org/", kind: "external" },
      { label: "MDN — Media Source Extensions API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Separate ingest (encoder → platform: RTMP, SRT, WebRTC/WHIP) from delivery (platform → viewers: HLS, DASH)",
              "Explain segmented HTTP delivery: manifests/playlists (`.m3u8`, `.mpd`) and media segments",
              "Explain adaptive bitrate (ABR): multiple renditions and client-side switching",
              "Reason about latency trade-offs: segment duration, Low-Latency HLS, CMAF chunks",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "RTMP: a TCP-based protocol from the Flash era that survives as the common ingest format.",
              "Transcoding into a bitrate ladder and packaging into segments (often CMAF fMP4).",
              "HLS (RFC 8216) vs MPEG-DASH: playlists vs MPD, codec/container support, player ecosystems.",
              "Why HTTP delivery wins at scale: CDN caching, firewall friendliness; latency costs and LL-HLS/LL-DASH.",
              "Where DRM plugs in (see content protection).",
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── ingress-routing (outline) ─────────────────────────────
  {
    slug: "ingress-routing",
    track: "networks",
    title: "Ingress and secure routing",
    summary:
      "How external traffic enters a cluster or VPC: L4 vs L7 load balancers, Kubernetes Ingress and Gateway API, host/path routing, TLS termination vs passthrough vs re-encryption, and mTLS between services.",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory", "system-design"],
    status: "outline",
    prerequisites: ["networks/http", "networks/tls-handshake"],
    related: ["networks/tls-handshake", "networks/websockets", "networks/cors", "cloud/kubernetes", "system-design/load-balancing-algorithms", "system-design/dns-tcp-lb-firewalls"],
    tags: ["ingress", "reverse-proxy", "tls-termination", "kubernetes", "gateway-api", "mtls"],
    sources: [
      { label: "Kubernetes — Ingress", url: "https://kubernetes.io/docs/concepts/services-networking/ingress/", kind: "docs" },
      { label: "Kubernetes — Gateway API", url: "https://gateway-api.sigs.k8s.io/", kind: "docs" },
      { label: "Let's Encrypt — How It Works (ACME)", url: "https://letsencrypt.org/how-it-works/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish L4 (TCP/UDP) from L7 (HTTP) load balancing and what each can see and route on",
              "Explain Kubernetes Ingress / Gateway API resources and the controller that implements them",
              "Compare TLS termination, passthrough (SNI routing) and re-encryption; where certificates live",
              "Apply secure routing basics: HTTPS redirects, HSTS, forwarded headers, mTLS between services, WAF/rate limits at the edge",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Request path: DNS → cloud load balancer → ingress controller (nginx/Envoy/Traefik) → Service → Pod.",
              "Host- and path-based routing rules; WebSocket and gRPC considerations.",
              "Certificate automation with cert-manager/ACME; `X-Forwarded-For` / `Forwarded` trust boundaries.",
              "Zero-trust routing with mTLS and service meshes.",
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── drm-content-protection (outline) ─────────────────────────────
  {
    slug: "drm-content-protection",
    track: "networks",
    title: "Content protection and DRM",
    summary:
      "How streaming services protect media: encryption with CENC, license servers, the browser's Encrypted Media Extensions (EME) and the major DRM systems (Widevine, FairPlay, PlayReady) — plus lighter options like signed URLs and token auth.",
    level: "advanced",
    frequency: "low",
    minutes: 25,
    kinds: ["theory", "system-design"],
    status: "outline",
    prerequisites: ["networks/streaming-protocols", "networks/tls-handshake"],
    related: ["networks/streaming-protocols", "networks/http-caching", "cloud/cdn-cloudfront", "backend/authentication-jwt-sessions"],
    tags: ["drm", "eme", "cenc", "widevine", "fairplay", "playready", "signed-urls"],
    sources: [
      { label: "W3C — Encrypted Media Extensions", url: "https://www.w3.org/TR/encrypted-media/", kind: "docs" },
      { label: "MDN — Encrypted Media Extensions API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API", kind: "docs" },
      { label: "Apple — FairPlay Streaming", url: "https://developer.apple.com/streaming/fps/", kind: "docs" },
      { label: "Google — Widevine", url: "https://www.widevine.com/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish access control (who may fetch segments) from DRM (who may decrypt and how output is restricted)",
              "Explain the license flow: player → EME → CDM → license server → decryption keys",
              "Explain Common Encryption (CENC, `cenc`/`cbcs` schemes) and multi-DRM packaging",
              "Know where each DRM runs (Widevine: Chrome/Android; FairPlay: Apple; PlayReady: Windows/Edge/TVs) and security levels",
            ],
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Lightweight protection: HTTPS, signed URLs/cookies at the CDN, short-lived tokens, AES-128 HLS encryption.",
              "Full DRM: encrypted segments + license servers + Content Decryption Modules in the browser/OS.",
              "Hardware-backed security levels and HDCP output protection.",
              "Operational trade-offs: cost, device coverage, license latency on startup.",
            ],
          },
        ],
      },
    ],
  },
];
