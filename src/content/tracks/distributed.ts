import type { Lesson, Track } from "../types";

export const track: Track = {
  slug: "distributed",
  title: "API and distributed system design",
  tagline: "Consensus, distributed transactions, events, idempotency and time — how many machines agree.",
  description:
    "What changes when one program becomes many machines talking over an unreliable network: how a cluster elects a leader and replicates a log (Raft), how to keep data consistent across services without a global transaction (2PC, sagas, the outbox), how event-driven systems are built, why every operation must be safe to retry, how to order events without a shared clock — and the design principles (coupling, cohesion, dependency inversion) that keep the code behind those services maintainable.",
  modules: [
    {
      id: "dist-agreement",
      title: "Agreement and time",
      summary: "Why there is no global clock, how logical clocks order events, and how Raft makes a cluster agree.",
      lessons: ["clocks-ordering", "consensus-basics"],
    },
    {
      id: "dist-data-across-services",
      title: "Data across services",
      summary: "Atomicity across databases and services: 2PC, sagas, the transactional outbox and safe retries.",
      lessons: ["distributed-transactions", "idempotency-patterns", "event-driven-architecture"],
    },
    {
      id: "dist-design-principles",
      title: "Design principles",
      summary: "Coupling, cohesion, dependency inversion and the trade-offs of object-oriented design.",
      lessons: ["coupling-cohesion-dependency-inversion", "oop-design-tradeoffs"],
    },
  ],
  milestones: [
    {
      id: "dist-raft-sim",
      title: "Raft leader election simulator",
      summary: "Simulate 3–5 nodes with randomized election timeouts, terms, RequestVote and heartbeats; show that at most one leader exists per term.",
      level: "advanced",
      requirements: [
        "Nodes start as followers with randomized election timeouts (e.g. 150–300 ms)",
        "Candidates increment the term, vote for themselves and request votes; a node grants at most one vote per term",
        "A candidate becomes leader only with a majority of floor(n/2)+1 votes",
        "Leaders send heartbeats (empty AppendEntries); a higher term seen anywhere forces step-down to follower",
        "Inject partitions and node crashes; log every term change and assert at most one leader per term",
      ],
      stretch: [
        "Add log replication with the log-matching check (prevLogIndex/prevLogTerm) and commit index",
        "Add the election restriction (vote only for candidates whose log is at least as up to date)",
      ],
      exercises: ["distributed/consensus-basics", "distributed/clocks-ordering"],
    },
    {
      id: "dist-order-saga",
      title: "Order checkout saga with an outbox",
      summary: "Implement an order → payment → inventory flow as an orchestrated saga, publishing events through a transactional outbox.",
      level: "advanced",
      requirements: [
        "Each service owns its own database; no cross-service transactions",
        "Write state changes and outbox rows in the same local transaction; a relay publishes outbox rows to a broker",
        "Consumers are idempotent (processed-message table keyed by message id)",
        "A failure in inventory triggers compensating actions (refund payment, cancel order)",
        "Show the saga's state machine and demonstrate recovery after killing the orchestrator mid-flow",
      ],
      stretch: [
        "Replace the polling relay with change data capture (e.g. Debezium reading the WAL)",
        "Add a choreography-based variant and compare traceability",
      ],
      exercises: [
        "distributed/distributed-transactions",
        "distributed/idempotency-patterns",
        "distributed/event-driven-architecture",
        "system-design/delivery-semantics",
      ],
    },
    {
      id: "dist-idempotent-api",
      title: "Idempotent payments API",
      summary: "Build a POST /payments endpoint that accepts an Idempotency-Key and is safe to retry under concurrency.",
      level: "intermediate",
      requirements: [
        "Store key, request fingerprint, status and response atomically (unique constraint on the key)",
        "Concurrent duplicates: one request proceeds, the other waits or gets 409 while in progress",
        "Same key with a different body returns 422",
        "Replays return the stored response byte-for-byte",
        "Keys expire after a retention window (e.g. 24 h)",
      ],
      exercises: ["distributed/idempotency-patterns", "system-design/api-idempotency"],
    },
  ],
  sources: [
    { label: "The Raft Consensus Algorithm (raft.github.io)", url: "https://raft.github.io/", kind: "docs" },
    { label: "Ongaro & Ousterhout — In Search of an Understandable Consensus Algorithm (Raft paper)", url: "https://raft.github.io/raft.pdf", kind: "external" },
    { label: "microservices.io — Saga pattern", url: "https://microservices.io/patterns/data/saga.html", kind: "external" },
    { label: "microservices.io — Transactional outbox", url: "https://microservices.io/patterns/data/transactional-outbox.html", kind: "external" },
    { label: "Lamport — Time, Clocks, and the Ordering of Events in a Distributed System (1978)", url: "https://lamport.azurewebsites.net/pubs/time-clocks.pdf", kind: "external" },
    { label: "Martin Fowler — Event Sourcing", url: "https://martinfowler.com/eaaDev/EventSourcing.html", kind: "external" },
    { label: "Martin Fowler — CQRS", url: "https://martinfowler.com/bliki/CQRS.html", kind: "external" },
    { label: "Stripe API — Idempotent requests", url: "https://docs.stripe.com/api/idempotent_requests", kind: "docs" },
  ],
};

export const lessons: Lesson[] = [
  // ───────────────────────────── consensus-basics ─────────────────────────────
  {
    slug: "consensus-basics",
    track: "distributed",
    title: "Consensus basics: Raft leader election, log replication and quorums",
    summary:
      "How a group of machines agrees on one ordered log despite crashes and network partitions — Raft's terms, elections, AppendEntries and majority quorums.",
    level: "advanced",
    frequency: "medium",
    minutes: 45,
    kinds: ["theory", "system-design", "quiz"],
    status: "authored",
    prerequisites: ["system-design/replication", "distributed/clocks-ordering"],
    related: ["system-design/cap-theorem", "system-design/consistency-models", "system-design/redundancy-failover", "databases/postgres-replication"],
    tags: ["raft", "consensus", "leader-election", "quorum", "replication", "etcd"],
    sources: [
      { label: "The Raft Consensus Algorithm (raft.github.io) — includes an interactive visualization", url: "https://raft.github.io/", kind: "docs" },
      { label: "Ongaro & Ousterhout — In Search of an Understandable Consensus Algorithm (extended version)", url: "https://raft.github.io/raft.pdf", kind: "external" },
      { label: "The Secret Lives of Data — Raft visual walkthrough", url: "https://thesecretlivesofdata.com/raft/", kind: "external" },
      { label: "etcd documentation — FAQ (cluster size and fault tolerance)", url: "https://etcd.io/docs/latest/faq/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what problem consensus solves and why it is hard (crashes, partitions, no shared clock)",
              "Describe Raft's three roles, terms, and how leader election works with randomized timeouts",
              "Trace log replication with AppendEntries, the log-matching check and the commit index",
              "Compute quorum size `floor(n/2)+1` and the number of failures a cluster tolerates",
              "Say where consensus is used in practice (etcd, Consul, CockroachDB, Kafka KRaft) and what it costs",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Imagine five clerks in different cities who must keep identical ledgers. Phone lines drop, clerks fall asleep, and nobody has a trustworthy clock. If any clerk could accept a write, two clerks might record conflicting entries at position 7. Consensus is the protocol that makes them agree on *one* entry per position, forever.",
          },
          {
            type: "p",
            text: "Raft's trick is to pick one clerk as **leader** for a numbered period (a **term**). Only the leader accepts writes, and an entry counts as final only when a **majority** has written it down. Any two majorities overlap in at least one clerk — so a future leader always learns about every final entry.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "**Consensus** is getting a set of nodes to agree on a value (or a sequence of values) such that: every decided value was proposed by someone (*validity*), no two nodes decide differently (*agreement / safety*), and, as long as a majority is up and can talk, the system eventually decides (*liveness*).",
          },
          {
            type: "p",
            text: "In practice we build a **replicated state machine**: every node applies the same commands in the same order to a deterministic state machine (e.g. a key-value store), so they all end in the same state. Consensus is used to agree on that ordered **log** of commands. Raft (2014) and Paxos (Lamport, 1989/1998) are the classic algorithms.",
          },
          {
            type: "table",
            head: ["Cluster size n", "Quorum floor(n/2)+1", "Failures tolerated"],
            rows: [
              ["1", "1", "0"],
              ["3", "2", "1"],
              ["4", "3", "1"],
              ["5", "3", "2"],
              ["7", "4", "3"],
            ],
          },
          {
            type: "callout",
            tone: "tip",
            title: "Why odd sizes",
            text: "A cluster of n tolerates `n - (floor(n/2)+1)` = `ceil(n/2) - 1` failures. Going from 3 to 4 nodes adds cost and a larger quorum but still tolerates only 1 failure — hence clusters of 3, 5 or 7.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "**Single leader failover without split brain**: plain primary–replica replication needs someone to decide who is primary; doing that with a heartbeat script can produce two primaries during a partition. Consensus makes the decision safe.",
              "**Coordination metadata**: Kubernetes stores all cluster state in etcd (Raft). Service discovery, distributed locks and configuration in Consul/ZooKeeper rely on consensus (ZooKeeper uses the ZAB protocol).",
              "**Strongly consistent databases**: CockroachDB, TiKV and YugabyteDB run a Raft group per range of keys; Kafka's KRaft mode replaces ZooKeeper with a Raft-based controller quorum.",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "How Raft works",
        blocks: [
          {
            type: "p",
            text: "Every node is in exactly one of three roles. Time is divided into **terms** — monotonically increasing integers. Each term starts with an election and has at most one leader. Terms act as a logical clock: any message carrying a higher term makes the receiver update its term and become a follower.",
          },
          {
            type: "compare",
            items: [
              { title: "Follower", points: ["Passive: answers RPCs from leader and candidates", "Resets its election timer on every valid heartbeat", "If the timer fires, becomes a candidate"] },
              { title: "Candidate", points: ["Increments term, votes for itself", "Sends RequestVote to all peers", "Wins with a majority, steps down on seeing a higher term, retries on timeout"] },
              { title: "Leader", points: ["Accepts client commands and appends them to its log", "Sends AppendEntries (also used as heartbeats)", "Advances the commit index when a majority stores an entry"] },
            ],
          },
          {
            type: "steps",
            steps: [
              { title: "Election timeout", detail: "Each follower waits a *randomized* timeout (the paper suggests e.g. 150–300 ms). Randomization makes it likely one node times out first and wins before others start competing, avoiding repeated split votes." },
              { title: "RequestVote", detail: "The candidate sends `RequestVote(term, candidateId, lastLogIndex, lastLogTerm)`. A node grants its vote if it hasn't voted in this term *and* the candidate's log is at least as up to date as its own (compare last term, then last index). This **election restriction** guarantees the new leader already holds every committed entry." },
              { title: "Becoming leader", detail: "With votes from `floor(n/2)+1` nodes (including itself) the candidate becomes leader and immediately sends heartbeats so others don't start elections." },
              { title: "AppendEntries", detail: "For each client command, the leader appends an entry `(term, index, command)` locally and sends `AppendEntries(term, prevLogIndex, prevLogTerm, entries[], leaderCommit)` to followers." },
              { title: "Log-matching check", detail: "A follower accepts only if its log has an entry at `prevLogIndex` with term `prevLogTerm`. If not, it rejects; the leader decrements `nextIndex` for that follower and retries, eventually overwriting the follower's conflicting suffix." },
              { title: "Commit", detail: "Once an entry from the *current* term is stored on a majority, the leader marks it committed, applies it to its state machine and replies to the client. Followers learn the commit index via `leaderCommit` and apply too." },
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "The subtle commit rule",
            text: "A leader never commits an entry from a *previous* term just by counting replicas. It commits an entry of its own term; earlier entries become committed indirectly because of log matching. Figure 8 of the Raft paper shows how counting replicas of old-term entries could lose a 'committed' entry.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Algorithm vs production implementations",
            text: "The paper defines the core protocol. Real systems (etcd's raft library, HashiCorp Raft) add pre-vote (to stop a partitioned node from bumping terms and disrupting the cluster), leader leases or ReadIndex for linearizable reads, log compaction via snapshots, batching/pipelining and joint-consensus or single-server membership changes. Check your implementation's docs for which are enabled.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: leader crash in a 5-node cluster",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Steady state", detail: "S1 is leader for term 3. Log index 1–4 is committed on S1–S5. S1 appends index 5 (`SET x=9`) and sends AppendEntries; only S2 stores it before S1 crashes." },
              { title: "Timeouts", detail: "S3, S4, S5 stop receiving heartbeats. S4's randomized timer fires first; it moves to term 4, votes for itself and sends RequestVote with lastLogIndex=4, lastLogTerm=3." },
              { title: "Votes", detail: "S3 and S5 have logs no newer than S4's → grant. S2 has index 5 (more up to date) → refuses. S4 has 3 votes = floor(5/2)+1 → leader of term 4." },
              { title: "Uncommitted entry", detail: "Index 5 (`SET x=9`) was never committed (only 2 of 5 had it) and the client never got a success reply. S4 overwrites S2's index 5 with its own entries. No *acknowledged* write was lost." },
              { title: "Old leader returns", detail: "S1 restarts as a follower in term 3, receives AppendEntries with term 4, updates its term and has its stale suffix replaced." },
            ],
          },
        ],
      },
      {
        id: "visualization",
        blocks: [
          {
            type: "flow",
            nodes: ["Client", "Leader appends entry", "AppendEntries to followers", "Majority ack", "Commit + apply", "Reply to client"],
            caption: "Conceptual write path in Raft. Followers apply the entry when they learn the new commit index.",
          },
          {
            type: "p",
            text: "For an animated, interactive version, use the visualization linked from [raft.github.io](https://raft.github.io/) — you can kill nodes and watch elections happen.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Partitioned minority leader**: an old leader on the minority side of a partition still thinks it's leader but cannot commit anything (no majority). Reads served locally from it may be stale — hence ReadIndex/leases for linearizable reads.",
              "**Split votes**: two candidates each get 2 of 5 votes; both time out and retry with new randomized timeouts and a higher term.",
              "**Disruptive servers**: a node isolated for a while keeps incrementing its term; on rejoining it forces the leader to step down. Pre-vote (an optional extension) fixes this.",
              "**Even-sized clusters** split 2–2 cannot elect anyone; that is the price of safety.",
              "**Membership changes** must not create two disjoint majorities (old config and new config). Raft uses joint consensus or one-server-at-a-time changes.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Thinking consensus makes a system available during any failure — it chooses **consistency over availability** (CP in CAP): the minority side stops accepting writes.",
              "Saying quorum is `n/2` — it is `floor(n/2)+1`, a strict majority.",
              "Believing more nodes = faster writes. Each write needs a majority round trip; more nodes means more replication traffic and a bigger quorum.",
              "Using wall-clock time for ordering. Raft orders by (term, index), not timestamps.",
              "Running a 2-node cluster 'for HA': quorum is 2, so losing either node halts writes.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Choice", "Gain", "Cost"],
            rows: [
              ["Consensus (Raft/Paxos)", "Linearizable, no split brain, automatic failover", "Majority round trip per write; unavailable without a majority; operational complexity"],
              ["Async primary–replica", "Low write latency, simple", "Failover can lose acknowledged writes; split-brain risk without fencing"],
              ["Leaderless quorums (Dynamo-style, R+W>N)", "High availability, no election pause", "Conflicts need resolution (last-write-wins, vector clocks, CRDTs); not linearizable by default"],
              ["Larger cluster (5 or 7)", "Tolerates more failures", "Higher write latency and network traffic"],
            ],
          },
        ],
      },
      {
        id: "real-world",
        blocks: [
          {
            type: "list",
            items: [
              "**etcd** (Kubernetes' brain) — Raft; the docs recommend odd cluster sizes, typically 3 or 5.",
              "**Consul**, **CockroachDB**, **TiKV**, **YugabyteDB** — Raft (CockroachDB and TiKV run many Raft groups, one per range/region).",
              "**Kafka KRaft** — a Raft-based controller quorum replaced ZooKeeper (ZooKeeper removed in Kafka 4.0).",
              "**ZooKeeper** — ZAB, a Paxos-family atomic broadcast protocol; **Google Chubby/Spanner** — Paxos.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Consensus lets nodes agree on an ordered log despite crashes and partitions. In Raft, followers that miss heartbeats for a randomized timeout become candidates, bump the term and request votes; a majority (`floor(n/2)+1`) makes a leader, and a node only votes for candidates whose log is at least as up to date. The leader replicates entries with AppendEntries, followers check the previous index/term to keep logs identical, and an entry is committed once a majority stores it. Because any two majorities overlap, committed entries survive leader changes. The trade-off is availability: without a majority, no writes.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "**Safety argument**: election restriction + majority overlap ⇒ every future leader holds all committed entries (Leader Completeness). Log matching ⇒ if two logs agree on (index, term) they agree on all prior entries.",
              "**Reads**: serving reads from the leader is not automatically linearizable — a deposed leader might not know. Options: append a no-op/ReadIndex round with a majority, or leader leases that rely on bounded clock drift.",
              "**FLP impossibility**: in a fully asynchronous system no deterministic algorithm can guarantee consensus terminates with even one crash. Raft keeps safety always and gets liveness from timeouts (partial synchrony).",
              "**Performance**: batching and pipelining AppendEntries, plus snapshotting to bound log size, are what make production Raft fast.",
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
              "Consensus = agreeing on one ordered log; replicated state machines apply it deterministically",
              "Raft: follower → candidate → leader; terms are a logical clock; randomized timeouts avoid split votes",
              "Quorum is `floor(n/2)+1`; n nodes tolerate `ceil(n/2)-1` failures; use odd sizes",
              "Committed = stored on a majority (entry of the current term); acknowledged writes survive failover",
              "It's CP: a minority partition cannot make progress",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Consensus", definition: "Agreement among nodes on a single value or ordered sequence of values, tolerant of some failures." },
      { term: "Replicated state machine", definition: "Identical deterministic state machines on many nodes that stay in sync by applying the same log of commands in the same order." },
      { term: "Term", definition: "Raft's monotonically increasing epoch number; each term has at most one leader." },
      { term: "Quorum", definition: "The minimum number of nodes whose agreement is required — in Raft a strict majority, floor(n/2)+1." },
      { term: "Split brain", definition: "Two nodes simultaneously acting as leader/primary and accepting conflicting writes." },
      { term: "Commit index", definition: "The highest log index known to be stored on a majority and safe to apply." },
      { term: "AppendEntries", definition: "The Raft RPC the leader uses to replicate log entries and, when empty, as a heartbeat." },
      { term: "RequestVote", definition: "The Raft RPC a candidate uses to ask for votes in a new term." },
    ],
    followUps: [
      { q: "Why are election timeouts randomized?", a: "If all followers timed out together they'd all become candidates, split the vote and repeat forever. Randomizing spreads timeouts so one node usually wins before others start." },
      { q: "How many failures does a 6-node cluster tolerate?", a: "Quorum is floor(6/2)+1 = 4, so it tolerates 2 failures — the same as 5 nodes, with more overhead." },
      { q: "Can a Raft cluster lose a write it acknowledged?", a: "Not if the implementation is correct and fsyncs before acknowledging: a write is acknowledged only after it's committed on a majority, and the election restriction ensures every future leader has it." },
      { q: "Is Raft the same as Paxos?", a: "They solve the same problem with equivalent fault tolerance. Raft was designed for understandability: strong leader, explicit election and log replication sub-problems. Multi-Paxos is structurally similar once a stable leader exists." },
      { q: "What happens to clients talking to a leader that got partitioned away?", a: "Their writes can't reach a majority, so they never commit; they time out and the client retries against the new leader (usually discovered via a redirect or by trying other nodes). Retries should be idempotent." },
    ],
    quiz: [
      {
        id: "cb-q1",
        prompt: "A Raft cluster has 7 nodes. What is the quorum size and how many node failures can it tolerate while still making progress?",
        options: ["Quorum 3, tolerates 4", "Quorum 4, tolerates 3", "Quorum 4, tolerates 4", "Quorum 7, tolerates 0"],
        answer: 1,
        explanation: "floor(7/2)+1 = 4. With 3 failures, 4 nodes remain — still a majority.",
      },
      {
        id: "cb-q2",
        prompt: "Why does a follower refuse to vote for a candidate whose last log term is older than its own?",
        options: [
          "To save network bandwidth",
          "So that the elected leader is guaranteed to contain all committed entries",
          "Because terms must be even",
          "To make elections faster",
        ],
        answer: 1,
        explanation: "The election restriction ensures a committed entry (present on a majority) is present on at least one voter of any winning majority, so a candidate missing it cannot win.",
      },
      {
        id: "cb-q3",
        prompt: "A 5-node cluster is partitioned into {S1, S2} (S1 is the old leader) and {S3, S4, S5}. What happens?",
        options: [
          "Both sides keep accepting writes and merge later",
          "Neither side can accept writes",
          "The majority side elects a new leader and continues; S1 can't commit anything",
          "S1 continues as leader because it was elected first",
        ],
        answer: 2,
        explanation: "Only a majority (3) can elect and commit. S1 may still believe it's leader, but its writes never commit; when the partition heals it sees the higher term and steps down.",
      },
    ],
  },

  // ───────────────────────────── distributed-transactions ─────────────────────────────
  {
    slug: "distributed-transactions",
    track: "distributed",
    title: "Distributed transactions: 2PC, sagas and the outbox pattern",
    summary:
      "How to keep data consistent when one business operation spans several databases or services — two-phase commit, sagas with compensations, and the transactional outbox that removes the dual-write problem.",
    level: "advanced",
    frequency: "high",
    minutes: 50,
    kinds: ["theory", "system-design", "coding", "quiz"],
    status: "authored",
    prerequisites: ["databases/transactions-acid", "system-design/rabbitmq-kafka-sqs", "system-design/delivery-semantics"],
    related: [
      "distributed/idempotency-patterns",
      "distributed/event-driven-architecture",
      "distributed/consensus-basics",
      "system-design/locks-transactions-isolation",
      "system-design/monolith-vs-microservices",
    ],
    tags: ["2pc", "saga", "outbox", "compensation", "dual-write", "cdc", "microservices"],
    sources: [
      { label: "microservices.io — Pattern: Saga", url: "https://microservices.io/patterns/data/saga.html", kind: "external" },
      { label: "microservices.io — Pattern: Transactional outbox", url: "https://microservices.io/patterns/data/transactional-outbox.html", kind: "external" },
      { label: "PostgreSQL docs — PREPARE TRANSACTION (two-phase commit)", url: "https://www.postgresql.org/docs/current/sql-prepare-transaction.html", kind: "docs" },
      { label: "Garcia-Molina & Salem — Sagas (1987)", url: "https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf", kind: "external" },
      { label: "Debezium — Outbox event router", url: "https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Recognize the dual-write problem and why 'write DB, then publish' is unsafe",
              "Explain two-phase commit, its blocking failure mode and where it is still used",
              "Design a saga with compensating actions; choose orchestration vs choreography",
              "Implement the transactional outbox and explain why consumers must be idempotent",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Booking a trip means reserving a flight, a hotel and a car from three companies. You can't lock all three companies' systems at once. Instead you book them one by one, and if the car is unavailable you *cancel* the hotel and flight you already booked. That 'do, and if needed undo' sequence is a **saga**.",
          },
          {
            type: "p",
            text: "The alternative — a travel agent who asks all three 'can you commit?' and only then says 'commit!' — is **two-phase commit**. It gives true atomicity but if the agent disappears between the two phases, everyone waits holding their reservations.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Distributed transaction**: an operation that must change state in more than one independently-failing resource (two databases, a database and a message broker, several services) with all-or-nothing semantics.",
              "**Two-phase commit (2PC)**: a coordinator asks every participant to *prepare* (durably promise it can commit), then tells all to *commit* if every vote was yes, otherwise *abort*. Gives atomicity across resources.",
              "**Saga**: a sequence of local transactions, each in one service; if step k fails, compensating transactions undo steps k-1…1. Gives eventual consistency, not isolation.",
              "**Transactional outbox**: write the business change and an 'event to publish' row in the *same local transaction*; a separate relay publishes outbox rows to the broker. Makes state change + message atomic without 2PC.",
            ],
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "p",
            text: "Once each microservice owns its database, there is no shared transaction. The naive code below has a **dual-write** bug: the two writes go to different systems and either can fail independently.",
          },
          {
            type: "code",
            lang: "ts",
            caption: "The dual-write problem (pseudo-code)",
            code: `async function placeOrder(order: Order) {
  await db.query("INSERT INTO orders ...", [order.id]); // 1. commits
  // crash here → order exists, but nobody is ever told
  await broker.publish("order.placed", order);          // 2. may fail
  // or: publish first, then DB insert fails → event for a non-existent order
}`,
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "**Two-phase commit** in detail:",
          },
          {
            type: "steps",
            steps: [
              { title: "Phase 1 — prepare", detail: "Coordinator sends PREPARE to each participant. A participant does all the work, writes it durably (redo log, locks held) and votes YES, or votes NO. After voting YES it can no longer abort on its own." },
              { title: "Decision", detail: "If all voted YES, the coordinator durably logs COMMIT; otherwise ABORT. This log record is the single point of truth." },
              { title: "Phase 2 — commit/abort", detail: "Coordinator sends the decision; participants apply it, release locks and acknowledge. The coordinator retries until every participant acknowledges." },
              { title: "Failure mode", detail: "If the coordinator crashes after participants voted YES but before they hear the decision, participants are **in doubt**: they must keep locks and wait for the coordinator to recover. 2PC is a *blocking* protocol." },
            ],
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "2PC in PostgreSQL",
            text: "Postgres exposes the participant side via `PREPARE TRANSACTION 'id'` / `COMMIT PREPARED 'id'`; it is disabled by default (`max_prepared_transactions = 0`). Orphaned prepared transactions hold locks and block VACUUM until resolved. XA (the X/Open standard) is the equivalent across vendors; Java's JTA uses it.",
          },
          {
            type: "p",
            text: "**Sagas** come in two coordination styles:",
          },
          {
            type: "compare",
            items: [
              {
                title: "Orchestration",
                points: [
                  "A central orchestrator (state machine) tells each service what to do next",
                  "Flow is explicit and easy to trace and test",
                  "Orchestrator is an extra component; risk of putting business logic in one 'god' service",
                  "Tools: Temporal, AWS Step Functions, Camunda, hand-rolled state machine table",
                ],
              },
              {
                title: "Choreography",
                points: [
                  "Each service reacts to events and emits new ones; no central brain",
                  "Loose coupling, easy to add listeners",
                  "Flow is implicit and spread across services; hard to see and debug",
                  "Cyclic event dependencies can appear",
                ],
              },
            ],
          },
          {
            type: "p",
            text: "The **outbox** removes the dual write by turning two writes into one local transaction plus an asynchronous, retriable publish:",
          },
          {
            type: "code",
            lang: "sql",
            caption: "Transactional outbox (PostgreSQL)",
            code: `BEGIN;
INSERT INTO orders (id, customer_id, total, status)
VALUES ('o-42', 'c-7', 99.00, 'PENDING');

INSERT INTO outbox (id, aggregate_id, type, payload)
VALUES (gen_random_uuid(), 'o-42', 'order.placed',
        '{"orderId":"o-42","total":99.00}');
COMMIT;

-- Relay (polling variant), run repeatedly:
SELECT id, type, payload FROM outbox
WHERE published_at IS NULL
ORDER BY created_at
LIMIT 100
FOR UPDATE SKIP LOCKED;
-- publish each row to the broker, then:
-- UPDATE outbox SET published_at = now() WHERE id = ANY($1);`,
          },
          {
            type: "p",
            text: "If the relay crashes after publishing but before marking rows, it republishes them — so the outbox guarantees **at-least-once** delivery. Consumers must deduplicate (see the idempotency-patterns lesson). Instead of polling, change data capture (e.g. Debezium tailing the Postgres WAL) can stream outbox inserts to Kafka.",
          },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: an orchestrated checkout saga",
        blocks: [
          {
            type: "flow",
            nodes: ["Create order (PENDING)", "Authorize payment", "Reserve inventory", "Confirm order"],
            caption: "Happy path. Each arrow is a command and a reply via the broker; each step is a local transaction.",
          },
          {
            type: "steps",
            steps: [
              { title: "T1 Order service", detail: "Inserts order PENDING + outbox command `AuthorizePayment`. Compensation C1: mark order CANCELLED." },
              { title: "T2 Payment service", detail: "Authorizes the card, replies `PaymentAuthorized`. Compensation C2: void/refund the authorization." },
              { title: "T3 Inventory service", detail: "Tries to reserve stock — fails: out of stock. Replies `ReservationFailed`." },
              { title: "Compensate", detail: "Orchestrator runs C2 (void payment), then C1 (cancel order), in reverse order. Each compensation is itself retried until it succeeds, so it must be idempotent." },
              { title: "Pivot step", detail: "Steps after the point of no return (e.g. 'ship parcel') can't be compensated; design them to be retriable until they succeed and place them last." },
            ],
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**No isolation**: other transactions can see the intermediate state (order PENDING, payment authorized). Countermeasures: semantic locks (a PENDING status others respect), commutative updates, re-reading values, or putting the riskiest step first.",
              "**Compensation is not rollback**: you can't un-send an email; you send a 'sorry, cancelled' email. Some actions are irreversible.",
              "**Out-of-order messages**: a compensation can arrive before the action it compensates (e.g. timeout-triggered cancel races the original request). Record 'cancelled' so the late action becomes a no-op.",
              "**Outbox ordering**: with several relay workers, per-aggregate ordering needs partitioning by aggregate id (e.g. Kafka key).",
              "**Outbox growth**: delete or archive published rows, or the table and its index bloat.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Publishing to Kafka/RabbitMQ inside a DB transaction and assuming it's atomic — the broker isn't part of the DB transaction.",
              "Assuming the outbox gives exactly-once delivery — it gives at-least-once; dedupe on the consumer.",
              "Writing compensations that aren't idempotent or that can fail permanently.",
              "Reaching for 2PC across microservices owned by different teams — it couples their availability and lock lifetimes.",
              "Calling a saga 'ACID'. It is ACD without the I, and only eventually consistent.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Approach", "Consistency", "Availability / latency", "Complexity"],
            rows: [
              ["2PC / XA", "Atomic, isolated", "Blocking on coordinator failure; locks held across network round trips", "Needs XA-capable resources and a durable coordinator"],
              ["Saga (orchestrated)", "Eventual; no isolation", "Each service commits locally; tolerant of slow services", "Compensations + state machine; explicit flow"],
              ["Saga (choreographed)", "Eventual; no isolation", "Same", "Implicit flow; harder to observe"],
              ["Outbox + idempotent consumers", "Atomic state+event; at-least-once delivery", "Async publish adds latency", "Relay or CDC pipeline to operate"],
              ["Avoid it: redraw boundaries", "Local ACID", "Best", "May mean merging services that always change together"],
            ],
          },
          {
            type: "callout",
            tone: "tip",
            title: "First question to ask",
            text: "If two pieces of data must always change atomically, they probably belong in the same service and database. Distributed transactions are often a symptom of a boundary drawn in the wrong place.",
          },
        ],
      },
      {
        id: "real-world",
        blocks: [
          {
            type: "list",
            items: [
              "Spanner and CockroachDB do run 2PC across shards, but each participant is a Raft/Paxos group, so a 'participant' doesn't fail as a single machine — this mitigates 2PC's blocking problem.",
              "Payment and e-commerce systems typically use sagas with workflow engines (Temporal, Step Functions) for long-running flows.",
              "The outbox + Debezium + Kafka combination is a common way to publish domain events reliably from Postgres/MySQL.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "When one operation spans several services, you can't use one ACID transaction. Two-phase commit gives atomicity — prepare everyone, then commit — but it's blocking if the coordinator dies and holds locks across the network, so it's rare between microservices. The usual answer is a saga: a chain of local transactions with compensating actions to undo earlier steps on failure, coordinated by an orchestrator or by events. To reliably emit those events, use a transactional outbox: write the state change and the event row in one local transaction and have a relay or CDC publish it. Delivery is at-least-once, so consumers and compensations must be idempotent.",
          },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain *why* 2PC blocks: after voting YES a participant has given up its right to abort unilaterally, so without the decision it must wait. Three-phase commit reduces blocking only under synchronous network assumptions.",
              "Discuss saga isolation anomalies: lost updates, dirty reads, fuzzy reads — and countermeasures (semantic lock, commutative updates, pessimistic view, reread value, version file).",
              "Outbox vs 'listen to yourself' (publish first, update state from your own consumed event) vs CDC on business tables directly.",
              "Inbox pattern on the consumer: record processed message ids in the same transaction as the side effect.",
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
              "Writing to two systems without coordination (dual write) loses or invents events on crash",
              "2PC: atomic but blocking; used inside distributed databases, rarely across services",
              "Saga: local transactions + compensations; eventual consistency, no isolation",
              "Outbox: state + event in one local transaction; relay publishes at-least-once",
              "Everything retried must be idempotent",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Dual write", definition: "Updating two separate systems (e.g. a database and a broker) in sequence without a shared transaction, so a crash between them leaves them inconsistent." },
      { term: "Coordinator", definition: "In 2PC, the process that collects votes and decides commit or abort." },
      { term: "In-doubt transaction", definition: "A participant that voted YES in 2PC but hasn't learned the outcome; it must hold locks until it does." },
      { term: "Compensating transaction", definition: "A semantic undo of an earlier saga step, such as refunding a charge." },
      { term: "Orchestration", definition: "A saga coordinated by a central component that issues commands to each participant." },
      { term: "Choreography", definition: "A saga where services react to each other's events without a central coordinator." },
      { term: "Outbox", definition: "A table written in the same transaction as business data, holding messages to be published later by a relay." },
      { term: "CDC (change data capture)", definition: "Streaming row changes from a database's log (e.g. Postgres WAL) to other systems." },
    ],
    followUps: [
      { q: "Why not just retry the publish until it succeeds?", a: "Retries don't help if the process crashes between commit and publish — the intent to publish is lost from memory. The outbox persists that intent durably in the same transaction." },
      { q: "How do you guarantee ordering of outbox events?", a: "Publish in commit/creation order per aggregate and partition the broker topic by aggregate id; consumers then see per-aggregate order. Global ordering across aggregates is usually unnecessary and expensive." },
      { q: "When would you still use 2PC?", a: "Inside a single distributed database (shards with replicated participants), or between a few resources in one trust domain that support XA, when strict atomicity is worth the latency and blocking risk." },
      { q: "What if a compensation fails?", a: "Retry it (it must be idempotent) with backoff; if it keeps failing, park it in a dead-letter queue and alert a human. Design compensations that can't fail for business reasons." },
    ],
    quiz: [
      {
        id: "dt-q1",
        prompt: "In 2PC, participant P voted YES and then lost contact with the coordinator. What must P do?",
        options: ["Abort after a timeout", "Commit after a timeout", "Wait (holding locks) until it learns the decision", "Ask another participant and always commit"],
        answer: 2,
        explanation: "After voting YES, P can't decide alone: others may have committed or aborted. It can ask peers, but if no one knows the outcome it blocks.",
      },
      {
        id: "dt-q2",
        prompt: "An order service inserts an order and an outbox row in one transaction. The relay publishes the event, then crashes before marking it published. What happens?",
        options: [
          "The event is lost",
          "The event is published again after restart, so consumers may see it twice",
          "The order row is rolled back",
          "The broker deduplicates it automatically",
        ],
        answer: 1,
        explanation: "The outbox guarantees at-least-once delivery. Consumers must be idempotent (e.g. track processed event ids).",
      },
      {
        id: "dt-q3",
        prompt: "Which property does a saga NOT provide?",
        options: ["Atomicity (eventually all or compensated)", "Isolation", "Durability of each local transaction", "Consistency of each service's local invariants"],
        answer: 1,
        explanation: "Intermediate states are visible to other transactions; sagas need countermeasures like semantic locks.",
      },
    ],
  },

  // ───────────────────────────── idempotency-patterns ─────────────────────────────
  {
    slug: "idempotency-patterns",
    track: "distributed",
    title: "Idempotency patterns: safe retries, idempotency keys and deduplication",
    summary:
      "Networks force retries, and retries cause duplicates. Learn how idempotency keys, dedup tables, conditional writes and natural idempotence make 'at-least-once' behave like 'effectively once'.",
    level: "intermediate",
    frequency: "high",
    minutes: 35,
    kinds: ["theory", "coding", "system-design", "quiz"],
    status: "authored",
    prerequisites: ["system-design/delivery-semantics", "networks/http"],
    related: [
      "system-design/api-idempotency",
      "distributed/distributed-transactions",
      "distributed/event-driven-architecture",
      "backend/webhooks-dlq",
      "system-design/circuit-breakers-timeouts-retries",
    ],
    tags: ["idempotency", "retries", "deduplication", "exactly-once", "idempotency-key"],
    sources: [
      { label: "Stripe API — Idempotent requests", url: "https://docs.stripe.com/api/idempotent_requests", kind: "docs" },
      { label: "IETF draft — The Idempotency-Key HTTP Header Field", url: "https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/", kind: "docs" },
      { label: "RFC 9110 — HTTP Semantics, §9.2.2 Idempotent Methods", url: "https://www.rfc-editor.org/rfc/rfc9110#name-idempotent-methods", kind: "docs" },
      { label: "AWS Builders' Library — Making retries safe with idempotent APIs", url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define idempotency precisely and distinguish it from 'safe' and from 'exactly-once'",
              "Know which HTTP methods are idempotent by spec and why POST isn't",
              "Implement an idempotency-key store that handles replays, mismatched bodies and concurrent duplicates",
              "Make message consumers idempotent with dedup tables, conditional writes and versioning",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "You press 'Pay' and the spinner hangs. Did the payment go through? The client can't know: the request may have been lost, or the *response* may have been lost after the charge succeeded. The only safe move is to retry — and that is only safe if the server recognizes 'this is the same payment I already did'.",
          },
          {
            type: "p",
            text: "A light switch has an 'on' button (idempotent: pressing twice = on) and a 'toggle' button (not idempotent: pressing twice = off). Good distributed APIs are designed like the 'on' button, or carry a ticket number so a repeated toggle is recognized.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "p",
            text: "An operation is **idempotent** if performing it once or many times has the same effect on server state as performing it once: `f(f(x)) = f(x)`. The *responses* may differ (a second DELETE may return 404) — idempotency is about side effects.",
          },
          {
            type: "table",
            head: ["HTTP method", "Safe (no state change)", "Idempotent (RFC 9110)"],
            rows: [
              ["GET, HEAD, OPTIONS", "Yes", "Yes"],
              ["PUT", "No", "Yes — 'set resource to this'"],
              ["DELETE", "No", "Yes — deleting twice leaves it deleted"],
              ["POST", "No", "No — 'create/process this' may run twice"],
              ["PATCH", "No", "Not guaranteed — depends on the patch (`set x=5` yes, `increment x` no)"],
            ],
          },
          {
            type: "callout",
            tone: "misconception",
            title: "Exactly-once delivery",
            text: "Over an unreliable network you cannot guarantee a message is *delivered* exactly once. You get at-most-once (may lose) or at-least-once (may duplicate). 'Exactly-once' in practice means **at-least-once delivery + idempotent processing** = effectively-once effects.",
          },
        ],
      },
      {
        id: "why",
        blocks: [
          {
            type: "list",
            items: [
              "Clients, load balancers, SDKs and service meshes retry on timeouts automatically",
              "Message brokers (SQS, Kafka consumers, RabbitMQ with acks) redeliver unacknowledged messages",
              "Webhook senders retry on non-2xx responses",
              "The outbox pattern and sagas rely on retries, so every consumer and compensation must tolerate duplicates",
            ],
          },
        ],
      },
      {
        id: "internals",
        title: "Patterns",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "Natural idempotence", detail: "Design the operation as 'set' rather than 'change': `UPDATE accounts SET status='closed'` instead of toggles; `PUT /users/42` with the full representation." },
              { title: "Client-generated IDs", detail: "The client picks the resource id (UUID). `INSERT ... ON CONFLICT (id) DO NOTHING` makes create-retries harmless." },
              { title: "Idempotency key", detail: "For non-idempotent POSTs, the client sends a unique `Idempotency-Key` header. The server stores key → (request fingerprint, status, response). A replay returns the stored response; same key with a different body is rejected." },
              { title: "Dedup / inbox table", detail: "Consumers record processed message ids in the *same transaction* as the side effect: `INSERT INTO processed(msg_id)` with a unique constraint; a duplicate violates it and the transaction is skipped." },
              { title: "Conditional writes / versions", detail: "`UPDATE ... WHERE version = 7` (optimistic concurrency) or DynamoDB condition expressions: a replayed write against an already-advanced version does nothing." },
            ],
          },
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Minimal in-memory idempotency-key handling",
            code: `const store = new Map(); // idempotencyKey -> { fingerprint, response }
let balance = 100;

function charge(key, body) {
  const fp = JSON.stringify(body);
  const prev = store.get(key);
  if (prev) {
    if (prev.fingerprint !== fp) return { status: 422, error: "key reused with different body" };
    return prev.response; // replay the stored response
  }
  balance -= body.amount;
  const response = { status: 201, chargeId: "ch_" + (store.size + 1), balance };
  store.set(key, { fingerprint: fp, response });
  return response;
}

console.log(JSON.stringify(charge("k1", { amount: 30 })));
console.log(JSON.stringify(charge("k1", { amount: 30 }))); // client retry after a timeout
console.log(JSON.stringify(charge("k1", { amount: 50 })));
console.log("final balance:", balance);`,
            output: `{"status":201,"chargeId":"ch_1","balance":70}
{"status":201,"chargeId":"ch_1","balance":70}
{"status":422,"error":"key reused with different body"}
final balance: 70`,
          },
          {
            type: "p",
            text: "The in-memory version ignores two production problems: **concurrency** (two copies of the same request arriving at once) and **atomicity** (crashing after charging but before storing the response). The SQL version claims the key first with a unique constraint:",
          },
          {
            type: "code",
            lang: "sql",
            caption: "Durable idempotency keys (PostgreSQL sketch)",
            code: `CREATE TABLE idempotency_keys (
  key          text PRIMARY KEY,
  fingerprint  text NOT NULL,
  status       text NOT NULL,          -- 'in_progress' | 'done'
  response     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 1. Claim the key. 0 rows inserted => someone else has it.
INSERT INTO idempotency_keys (key, fingerprint, status)
VALUES ($1, $2, 'in_progress')
ON CONFLICT (key) DO NOTHING;

-- 2. If claimed: do the work and store the response
--    in the SAME transaction as the business write where possible.
-- 3. If not claimed: SELECT the row.
--    fingerprint differs -> 422; status in_progress -> 409 (retry later);
--    status done -> return stored response.`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Side effects outside your DB** (calling a payment provider): pass your own idempotency key downstream, so their retry protection covers the external call.",
              "**Key retention**: keys expire (Stripe documents ~24 hours). A retry after expiry is treated as new — clients must not retry indefinitely with the same key.",
              "**Failures before any effect** (validation error, 500 before work started): decide whether to store the error. Many APIs store final results but allow retry after transient 5xx.",
              "**Ordering**: dedup handles duplicates, not reordering. Use version numbers or sequence checks if order matters.",
              "**Dedup window in brokers**: SQS FIFO deduplicates by `MessageDeduplicationId` within a 5-minute window only; Kafka's idempotent producer prevents duplicates from producer retries within a partition, not duplicate processing by consumers.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Generating the idempotency key on the server (it must come from the client, stable across retries).",
              "Check-then-act without a unique constraint: two concurrent requests both see 'no key' and both charge.",
              "Recording the message as processed in a separate transaction from the side effect.",
              "Assuming PATCH or POST are idempotent because 'our handler is simple'.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Technique", "Good for", "Cost"],
            rows: [
              ["Natural idempotence (set/PUT)", "State updates", "Requires API redesign; doesn't fit 'do X' commands"],
              ["Client-generated ids + ON CONFLICT", "Creates", "Clients must generate good unique ids"],
              ["Idempotency-key store", "Payments, orders, any POST", "Extra table, TTL cleanup, concurrency handling"],
              ["Inbox/dedup table", "Message consumers", "Grows with traffic; needs pruning"],
              ["Conditional writes", "Concurrent updaters", "Retry-on-conflict logic"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Idempotent means doing it twice has the same effect as once. Because networks lose responses, clients and brokers retry, so any operation that can be retried must be idempotent. GET, PUT and DELETE are idempotent by HTTP semantics; POST isn't, so we add an Idempotency-Key: the server atomically claims the key with a unique constraint, does the work, stores the response, and replays it for duplicates — rejecting the same key with a different body. For message consumers we record processed ids in the same transaction as the effect. That's how at-least-once delivery becomes effectively-once processing.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Idempotency is about effects, not identical responses",
              "Exactly-once delivery is impossible; at-least-once + idempotent processing is the practical answer",
              "Prefer natural idempotence; otherwise idempotency keys, dedup tables or conditional writes",
              "Claim keys atomically and store results in the same transaction as the effect",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Idempotent", definition: "An operation whose repeated application has the same effect as applying it once." },
      { term: "Safe method", definition: "An HTTP method that is not expected to change server state (GET, HEAD, OPTIONS)." },
      { term: "Idempotency key", definition: "A client-generated unique token sent with a request so the server can recognize retries of it." },
      { term: "Request fingerprint", definition: "A hash of the request parameters stored with an idempotency key to detect reuse of a key for a different request." },
      { term: "At-least-once delivery", definition: "A guarantee that a message is delivered one or more times; duplicates are possible." },
      { term: "Inbox (dedup) table", definition: "A table of processed message ids written atomically with the consumer's side effects." },
    ],
    followUps: [
      { q: "Is DELETE idempotent if the second call returns 404?", a: "Yes. Idempotency concerns state: after one or many DELETEs the resource is gone. Different status codes are allowed." },
      { q: "How do you handle two identical requests arriving at the same moment?", a: "Insert the key with a unique constraint (or take a lock) before doing work. The loser sees the key in progress and returns 409 or waits and then returns the stored response." },
      { q: "Does Kafka's exactly-once semantics remove the need for idempotent consumers?", a: "Only for read-process-write flows that stay inside Kafka (transactions across consumed offsets and produced records). Side effects to external systems like a database or an email API still need idempotent handling." },
    ],
    quiz: [
      {
        id: "ip-q1",
        prompt: "Which operation is idempotent?",
        options: ["`UPDATE stock SET qty = qty - 1 WHERE id = 7`", "`POST /orders` without a key", "`UPDATE users SET email = 'a@b.c' WHERE id = 7`", "Appending a row to an audit log"],
        answer: 2,
        explanation: "Setting a value to a constant has the same effect no matter how many times it runs. Decrements, creates and appends accumulate.",
      },
      {
        id: "ip-q2",
        prompt: "A consumer charges a card and then inserts the message id into a `processed` table in a separate transaction. What can go wrong?",
        options: [
          "Nothing, this is correct",
          "A crash between the two steps leads to a double charge on redelivery",
          "The message is lost",
          "The broker will reject the ack",
        ],
        answer: 1,
        explanation: "The dedup record must be written atomically with the effect (or the external call must carry its own idempotency key).",
      },
    ],
  },

  // ───────────────────────────── event-driven-architecture ─────────────────────────────
  {
    slug: "event-driven-architecture",
    track: "distributed",
    title: "Event-driven architecture: events vs commands, event sourcing and CQRS",
    summary:
      "Services that communicate by publishing facts instead of calling each other: the difference between events and commands, event notification vs event-carried state, event sourcing, and CQRS read models.",
    level: "advanced",
    frequency: "high",
    minutes: 40,
    kinds: ["theory", "system-design", "quiz"],
    status: "authored",
    prerequisites: ["system-design/rabbitmq-kafka-sqs", "system-design/async-processing"],
    related: [
      "distributed/distributed-transactions",
      "distributed/idempotency-patterns",
      "distributed/clocks-ordering",
      "system-design/delivery-semantics",
      "system-design/monolith-vs-microservices",
    ],
    tags: ["events", "commands", "event-sourcing", "cqrs", "kafka", "pub-sub", "eventual-consistency"],
    sources: [
      { label: "Martin Fowler — What do you mean by \"Event-Driven\"?", url: "https://martinfowler.com/articles/201701-event-driven.html", kind: "external" },
      { label: "Martin Fowler — Event Sourcing", url: "https://martinfowler.com/eaaDev/EventSourcing.html", kind: "external" },
      { label: "Martin Fowler — CQRS", url: "https://martinfowler.com/bliki/CQRS.html", kind: "external" },
      { label: "microservices.io — Event sourcing pattern", url: "https://microservices.io/patterns/data/event-sourcing.html", kind: "external" },
      { label: "Apache Kafka documentation — Design", url: "https://kafka.apache.org/documentation/#design", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish events from commands and know who owns each",
              "Name Fowler's four 'event-driven' patterns and when each fits",
              "Explain event sourcing (state = fold over events), snapshots and projections",
              "Explain CQRS, why read models are eventually consistent, and when CQRS is overkill",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "A **command** is a request: 'Please ship order 42.' It can be refused and has one intended handler. An **event** is a fact in the past tense: 'Order 42 was placed.' It can't be refused — it already happened — and any number of listeners may react.",
          },
          {
            type: "p",
            text: "In request/response systems the order service must know to call billing, shipping and email. In an event-driven system it simply announces 'OrderPlaced' and each interested service subscribes. Adding a fraud-check service doesn't touch the order service at all.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Command", points: ["Imperative: `ShipOrder`", "One target handler; sender expects it to happen", "May be rejected / fail", "Couples sender to the receiver's capability"] },
              { title: "Event", points: ["Past tense: `OrderShipped`", "Zero or many subscribers; publisher doesn't know them", "Immutable fact; can't be rejected", "Couples consumers to the publisher's schema"] },
            ],
          },
          {
            type: "table",
            head: ["Pattern (Fowler)", "What it is", "Watch out for"],
            rows: [
              ["Event notification", "Thin event ('order 42 changed'); consumers call back for details", "Callback load on the source; hidden coupling"],
              ["Event-carried state transfer", "Event carries the data consumers need; they keep a local copy", "Data duplication; eventual consistency"],
              ["Event sourcing", "The event log *is* the source of truth; state is derived by replaying it", "Schema evolution of old events; complexity"],
              ["CQRS", "Separate models for writes (commands) and reads (queries)", "Two models to maintain; stale reads"],
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
              "**Temporal decoupling**: the consumer can be down; the broker buffers events",
              "**Extensibility**: new consumers subscribe without changing the producer",
              "**Load leveling**: spikes are absorbed by the queue instead of cascading timeouts",
              "**Audit/history** (with event sourcing): you know how state got where it is, and can rebuild new views from history",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "p",
            text: "**Event sourcing** stores every state change as an appended event per aggregate (e.g. per bank account). Current state is a left fold over its events. Appends use optimistic concurrency: 'append event at version 5 only if the stream is at version 4'.",
          },
          {
            type: "code",
            lang: "ts",
            caption: "State as a fold over events",
            code: `type Event =
  | { type: "Opened"; owner: string }
  | { type: "Deposited"; amount: number }
  | { type: "Withdrawn"; amount: number };

interface Account { owner: string; balance: number; version: number }

function apply(s: Account, e: Event): Account {
  switch (e.type) {
    case "Opened":    return { owner: e.owner, balance: 0, version: s.version + 1 };
    case "Deposited": return { ...s, balance: s.balance + e.amount, version: s.version + 1 };
    case "Withdrawn": return { ...s, balance: s.balance - e.amount, version: s.version + 1 };
  }
}

const events: Event[] = [
  { type: "Opened", owner: "ana" },
  { type: "Deposited", amount: 100 },
  { type: "Withdrawn", amount: 30 },
];
const state = events.reduce(apply, { owner: "", balance: 0, version: 0 });
console.log(state);`,
            output: `{ owner: 'ana', balance: 70, version: 3 }`,
          },
          {
            type: "list",
            items: [
              "**Snapshots**: periodically store the folded state at version N so loading doesn't replay millions of events.",
              "**Projections**: consumers fold the event stream into read-optimized tables (a 'balances by customer' view, a search index).",
              "**Upcasting**: old event versions are transformed to the current shape when read, because stored events are immutable.",
            ],
          },
          {
            type: "flow",
            nodes: ["Command", "Write model (validates, appends events)", "Event log / broker", "Projector", "Read model (denormalized)", "Query"],
            caption: "Conceptual CQRS + event sourcing pipeline. Reads lag writes by the projection delay.",
          },
          {
            type: "callout",
            tone: "spec-vs-impl",
            title: "Broker semantics vary",
            text: "Kafka keeps an ordered, replayable log per partition with consumer-managed offsets; RabbitMQ classic queues remove messages once acknowledged; SQS standard queues are at-least-once with best-effort ordering (FIFO queues add ordering per message group). Event sourcing needs a durable, replayable store — a database table or EventStoreDB — not a queue that deletes messages.",
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Duplicates and redelivery**: consumers must be idempotent.",
              "**Ordering**: guaranteed only within a partition/stream; key by aggregate id to keep one entity's events ordered.",
              "**Read-your-writes**: after a command, the UI may query a projection that hasn't caught up. Return the new version and have the read side wait for it, or update the UI optimistically.",
              "**Schema evolution**: events are a public contract; add fields compatibly, version event types, use a schema registry.",
              "**Poison messages**: an event that always fails processing blocks a partition — route to a dead-letter queue after N attempts.",
            ],
          },
        ],
      },
      {
        id: "mistakes",
        blocks: [
          {
            type: "list",
            items: [
              "Naming commands as events (`SendEmailEvent`) — it hides that the publisher depends on a specific handler.",
              "Using event sourcing for CRUD-shaped data with no need for history.",
              "Event chains so long nobody can tell what happens after 'OrderPlaced' — add tracing and a documented flow.",
              "Publishing events outside the DB transaction (dual write) instead of using an outbox.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["", "Request/response", "Event-driven"],
            rows: [
              ["Coupling", "Caller knows callees and waits", "Producer unaware of consumers"],
              ["Consistency", "Immediate (within a call chain)", "Eventual"],
              ["Failure", "Cascading timeouts", "Backlog grows; consumers catch up"],
              ["Debuggability", "Stack/trace follows the call", "Needs correlation ids and distributed tracing"],
              ["Fit", "Queries, user-facing reads needing an answer now", "Side effects, integrations, fan-out, analytics"],
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "A command asks one handler to do something and can fail; an event states a fact that already happened and any number of consumers can react. Event-driven systems decouple producers from consumers in time and knowledge, at the cost of eventual consistency and harder debugging. Event sourcing makes the event log the source of truth — state is replayed from events, with snapshots for speed — and CQRS separates the write model from denormalized read models built by projections, so reads can lag writes. I'd use them where history, audit or many read shapes matter, not for simple CRUD.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Commands: imperative, one handler. Events: past tense facts, many subscribers",
              "Notification vs event-carried state transfer vs event sourcing vs CQRS are different things",
              "Event sourcing: append-only events, fold to state, snapshots, projections, upcasting",
              "Expect duplicates, per-partition ordering, eventual consistency and schema evolution",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Event", definition: "An immutable record that something happened, named in the past tense." },
      { term: "Command", definition: "A request for a specific handler to perform an action; it may be rejected." },
      { term: "Event sourcing", definition: "Persisting state as the sequence of events that produced it, rather than only the latest values." },
      { term: "Projection", definition: "A read model built by consuming events and folding them into a query-friendly shape." },
      { term: "CQRS", definition: "Command Query Responsibility Segregation — separate models (and often stores) for writes and reads." },
      { term: "Aggregate", definition: "A cluster of domain objects treated as one consistency boundary; events are ordered per aggregate." },
    ],
    followUps: [
      { q: "Do you need event sourcing to do CQRS?", a: "No. CQRS only means separate read and write models — the read side can be fed by CDC, an outbox or even synchronous updates. Event sourcing pairs naturally with it but is independent." },
      { q: "How do you fix a bug in a projection?", a: "Fix the projector, reset its offset/position and replay the event history into a fresh read model, then switch reads over. This is a major benefit of keeping the log." },
      { q: "How do you delete personal data from an immutable event log (GDPR)?", a: "Common approaches: keep PII out of events and reference it, or encrypt per-subject data with a key you delete ('crypto-shredding')." },
    ],
    quiz: [
      {
        id: "eda-q1",
        prompt: "Which name best fits an event?",
        options: ["`ChargeCustomer`", "`CustomerCharged`", "`ChargeCustomerRequest`", "`DoCharge`"],
        answer: 1,
        explanation: "Events describe facts that already happened, in the past tense. The others are commands.",
      },
      {
        id: "eda-q2",
        prompt: "A user updates their profile and the next page load shows the old name, then the new one a second later. In a CQRS system, why?",
        options: ["The write failed and was retried", "The read model projection lags behind the write model", "Event sourcing lost the event", "The cache never expires"],
        answer: 1,
        explanation: "Read models are updated asynchronously from events, so they are eventually consistent.",
      },
    ],
  },

  // ───────────────────────────── clocks-ordering ─────────────────────────────
  {
    slug: "clocks-ordering",
    track: "distributed",
    title: "Clocks and ordering: physical clocks, Lamport timestamps and vector clocks",
    summary:
      "Why wall-clock timestamps can't order events across machines, and how Lamport clocks and vector clocks capture 'happened-before' instead.",
    level: "advanced",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "coding", "quiz"],
    status: "authored",
    prerequisites: ["system-design/replication"],
    related: ["distributed/consensus-basics", "system-design/consistency-models", "distributed/event-driven-architecture"],
    tags: ["lamport-clock", "vector-clock", "happened-before", "ntp", "clock-skew", "hlc"],
    sources: [
      { label: "Lamport — Time, Clocks, and the Ordering of Events in a Distributed System (1978)", url: "https://lamport.azurewebsites.net/pubs/time-clocks.pdf", kind: "external" },
      { label: "Kulkarni et al. — Logical Physical Clocks (Hybrid Logical Clocks)", url: "https://cse.buffalo.edu/tech-reports/2014-04.pdf", kind: "external" },
      { label: "Google Cloud Spanner — TrueTime and external consistency", url: "https://cloud.google.com/spanner/docs/true-time-external-consistency", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain why clock skew makes timestamp ordering unsafe (e.g. last-write-wins losing data)",
              "Define happened-before (→) and concurrency",
              "Run Lamport's clock rules and know what they do and don't tell you",
              "Use vector clocks to detect concurrent updates",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          {
            type: "p",
            text: "Two servers' clocks are synchronized by NTP but can still differ by milliseconds or more, and a clock can even jump backwards when corrected. If server A (clock slow) writes after server B but stamps an earlier time, 'last write wins' keeps B's older value. Time on separate machines is an estimate, not a fact.",
          },
          {
            type: "p",
            text: "What we usually need is not *when* but *what could have influenced what*. If B read A's message before writing, A's write came first — regardless of clocks. Logical clocks track exactly that causal relationship.",
          },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Happened-before (a → b)**: a and b are in the same process and a came first; or a is sending a message and b is receiving it; or transitively a → c → b.",
              "**Concurrent (a ∥ b)**: neither a → b nor b → a. Concurrent events have no causal order — any order is 'correct'.",
              "**Lamport clock**: one counter per process. Increment before each event; send the counter with messages; on receive set `L = max(L, received) + 1`. Guarantees: a → b ⇒ L(a) < L(b). The converse does **not** hold.",
              "**Vector clock**: a vector of counters, one per process. Increment your own slot on each event; on receive take the element-wise max then increment your slot. Guarantees: a → b ⇔ V(a) < V(b) (every element ≤ and at least one <). Incomparable vectors mean concurrent.",
            ],
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          {
            type: "code",
            lang: "js",
            runnable: true,
            caption: "Vector clocks detect concurrency that timestamps would hide",
            code: `// Vector clocks for 3 processes A, B, C (index 0, 1, 2)
const tick = (vc, i) => vc.map((v, j) => (j === i ? v + 1 : v));
const merge = (mine, other, i) => tick(mine.map((v, j) => Math.max(v, other[j])), i);
const compare = (x, y) => {
  const le = x.every((v, j) => v <= y[j]);
  const ge = x.every((v, j) => v >= y[j]);
  if (le && ge) return "equal";
  if (le) return "happened-before";
  if (ge) return "happened-after";
  return "concurrent";
};

let A = [0, 0, 0], B = [0, 0, 0], C = [0, 0, 0];
A = tick(A, 0);            // a1: A writes x=1
const msg = A;             // A sends its clock to B
B = merge(B, msg, 1);      // b1: B receives
C = tick(C, 2);            // c1: C writes x=2 independently

console.log("a1", JSON.stringify(A), "b1", JSON.stringify(B), "c1", JSON.stringify(C));
console.log("a1 vs b1:", compare(A, B));
console.log("b1 vs c1:", compare(B, C));`,
            output: `a1 [1,0,0] b1 [1,1,0] c1 [0,0,1]
a1 vs b1: happened-before
b1 vs c1: concurrent`,
          },
          {
            type: "p",
            text: "With Lamport clocks, b1 would be 2 and c1 would be 1, suggesting c1 came first — but they are actually concurrent. A system like Dynamo/Riak uses vector-clock-style versions to keep both values as *siblings* and let the application (or a CRDT) merge them.",
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Clock", "Size", "Tells you", "Used in"],
            rows: [
              ["Wall clock (NTP)", "1 timestamp", "Approximate real time; unsafe for ordering across nodes", "Logs, TTLs, LWW (with risk)"],
              ["Lamport", "1 integer", "A total order consistent with causality (tie-break by node id)", "Raft terms are a similar idea; mutual exclusion algorithms"],
              ["Vector clock", "1 integer per node", "Exact causality, detects concurrency", "Dynamo-style stores, version vectors"],
              ["Hybrid logical clock", "Timestamp + counter", "Causality, close to physical time", "CockroachDB, YugabyteDB"],
              ["TrueTime", "Interval [earliest, latest]", "Bounded uncertainty; waits it out for external consistency", "Google Spanner (GPS + atomic clocks)"],
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "Monotonic vs wall clock in code",
            text: "Measure durations and timeouts with a monotonic clock (`performance.now()`, Go's `time.Since` which uses the monotonic reading), never by subtracting wall-clock timestamps, which can jump.",
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          {
            type: "p",
            text: "Machine clocks drift and get corrected, so timestamps from different nodes can't reliably order events — last-write-wins can silently drop the newer write. Lamport clocks give each event a counter that respects causality: if a happened before b, a's number is smaller, but a smaller number doesn't prove causality. Vector clocks keep a counter per node, so you can tell happened-before from concurrent, which is what you need to detect conflicting updates. Production systems often use hybrid logical clocks, or Spanner's TrueTime with bounded uncertainty.",
          },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Physical clocks skew and jump; don't use them to order cross-node events",
              "Happened-before is the causal order; concurrent events have none",
              "Lamport: causality ⇒ smaller number (not the reverse)",
              "Vector clocks: exact causality and conflict detection, cost O(nodes)",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Clock skew", definition: "The difference between two machines' clocks at the same instant." },
      { term: "NTP", definition: "Network Time Protocol, which synchronizes clocks over a network to within milliseconds typically, with no hard guarantee." },
      { term: "Happened-before", definition: "Lamport's causal partial order on events: same-process order, send-before-receive, and transitivity." },
      { term: "Last-write-wins (LWW)", definition: "Conflict resolution that keeps the value with the highest timestamp, discarding the others." },
      { term: "Monotonic clock", definition: "A clock that never goes backwards, used for measuring elapsed time." },
    ],
    followUps: [
      { q: "If L(a) < L(b), did a happen before b?", a: "Not necessarily — they may be concurrent. Lamport clocks only guarantee the implication in the other direction." },
      { q: "Why don't all databases use vector clocks?", a: "Their size grows with the number of writers, and detecting concurrency pushes conflict resolution onto the application. Single-leader or consensus-based systems avoid concurrent writes to the same key instead." },
    ],
    quiz: [
      {
        id: "co-q1",
        prompt: "V(x) = [2,1,0] and V(y) = [1,2,0]. What is the relationship between x and y?",
        options: ["x happened before y", "y happened before x", "They are concurrent", "They are the same event"],
        answer: 2,
        explanation: "x is larger in slot 0, y is larger in slot 1 — neither vector dominates, so the events are concurrent.",
      },
      {
        id: "co-q2",
        prompt: "A process with Lamport clock 4 receives a message stamped 9. What is its clock after the receive event?",
        options: ["5", "9", "10", "13"],
        answer: 2,
        explanation: "max(4, 9) + 1 = 10.",
      },
    ],
  },

  // ───────────────────────────── coupling-cohesion-dependency-inversion ─────────────────────────────
  {
    slug: "coupling-cohesion-dependency-inversion",
    track: "distributed",
    title: "Coupling, cohesion and dependency inversion",
    summary:
      "The two forces behind every module and service boundary — keep related things together, unrelated things apart — and how depending on abstractions (dependency inversion) lets core logic ignore infrastructure.",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["go/interfaces", "typescript/types-vs-interfaces"],
    related: ["distributed/oop-design-tradeoffs", "system-design/monolith-vs-microservices"],
    tags: ["coupling", "cohesion", "solid", "dependency-inversion", "hexagonal-architecture"],
    sources: [
      { label: "Robert C. Martin — The Dependency Inversion Principle (C++ Report, 1996)", url: "https://web.archive.org/web/20110714224327/http://www.objectmentor.com/resources/articles/dip.pdf", kind: "external" },
      { label: "Alistair Cockburn — Hexagonal Architecture (Ports and Adapters)", url: "https://alistair.cockburn.us/hexagonal-architecture/", kind: "external" },
      { label: "Martin Fowler — Inversion of Control Containers and the Dependency Injection pattern", url: "https://martinfowler.com/articles/injection.html", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Define coupling and cohesion and recognize common kinds (data, temporal, deployment coupling; functional vs coincidental cohesion)",
              "State the Dependency Inversion Principle and distinguish it from dependency injection",
              "Apply ports and adapters so domain logic doesn't import the database or HTTP framework",
              "Relate these ideas to service boundaries: high cohesion inside a service, loose coupling between services",
            ],
          },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          {
            type: "list",
            items: [
              "Coupling: how much a change in one module forces changes in another; cohesion: how strongly a module's parts belong together",
              "Dependency inversion: high-level policy and low-level details both depend on abstractions owned by the policy side",
              "Dependency injection as a mechanism (constructor injection) vs DIP as a principle",
              "Ports and adapters / clean architecture, with a Go or TypeScript example of a repository interface",
              "Distributed coupling: shared databases, synchronous call chains and shared schemas as coupling sources",
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── oop-design-tradeoffs ─────────────────────────────
  {
    slug: "oop-design-tradeoffs",
    track: "distributed",
    title: "OOP design trade-offs: inheritance, composition and SOLID in practice",
    summary:
      "When object-oriented techniques help and when they hurt: inheritance vs composition, SOLID principles as heuristics, and how languages like Go and TypeScript change the picture.",
    level: "intermediate",
    frequency: "medium",
    minutes: 25,
    kinds: ["theory"],
    status: "outline",
    prerequisites: ["javascript/classes-inheritance", "go/interfaces"],
    related: ["distributed/coupling-cohesion-dependency-inversion", "javascript/prototypes", "javascript/mixins"],
    tags: ["oop", "solid", "composition", "inheritance", "design-patterns"],
    sources: [
      { label: "Gamma, Helm, Johnson, Vlissides — Design Patterns (1994), 'favor object composition over class inheritance'", kind: "external" },
      { label: "Go FAQ — Why is there no type inheritance?", url: "https://go.dev/doc/faq#inheritance", kind: "docs" },
      { label: "Barbara Liskov & Jeannette Wing — A Behavioral Notion of Subtyping (1994)", url: "https://dl.acm.org/doi/10.1145/197320.197383", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Compare inheritance and composition and explain the fragile base class problem",
              "Explain each SOLID principle with a concrete violation and fix",
              "Describe how structural typing (Go interfaces, TypeScript) reduces the need for class hierarchies",
              "Recognize over-engineering: abstractions with one implementation, deep hierarchies, pattern-for-pattern's-sake",
            ],
          },
        ],
      },
      {
        id: "summary",
        title: "What this lesson will cover",
        blocks: [
          {
            type: "list",
            items: [
              "Encapsulation, polymorphism and inheritance — and which one actually pays off most",
              "Composition over inheritance; delegation and embedding (Go struct embedding is not inheritance)",
              "SOLID: single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion",
              "Functional and data-oriented alternatives; when plain functions and data are simpler",
              "Interview framing: justify a design by the changes it makes easy and the ones it makes hard",
            ],
          },
        ],
      },
    ],
  },
];
