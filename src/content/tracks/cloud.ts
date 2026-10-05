import type { Lesson, Track } from "../types";

/**
 * Cloud, containers and Kubernetes.
 */

export const track: Track = {
  slug: "cloud",
  title: "Cloud, containers and Kubernetes",
  tagline: "From a Dockerfile to pods behind an ingress, on a real cloud, shipped by a pipeline.",
  description:
    "What a container actually is (namespaces, cgroups, layered filesystems), how images are built and kept small, how Kubernetes schedules and heals workloads, how the big three clouds map onto each other, and how code gets from a commit to production through CI/CD, VMs and CDNs.",
  modules: [
    {
      id: "cloud-containers",
      title: "Containers",
      summary: "Images, layers, namespaces and cgroups, multi-stage builds and the container lifecycle.",
      lessons: ["docker"],
    },
    {
      id: "cloud-orchestration",
      title: "Orchestration",
      summary: "Pods, Deployments, Services, Ingress, probes and scheduling in Kubernetes.",
      lessons: ["kubernetes"],
    },
    {
      id: "cloud-platforms",
      title: "Cloud platforms and delivery",
      summary: "Mapping AWS/GCP/Azure services, deploying to EC2, CDNs and edge compute, and CI/CD pipelines.",
      lessons: ["cloud-providers", "ec2-deployment", "cdn-cloudfront", "ci-cd"],
    },
  ],
  milestones: [
    {
      id: "cloud-dockerize-probes",
      title: "Dockerize and deploy with health probes",
      summary: "Containerize a small HTTP service with a multi-stage build and run it on Kubernetes (kind/minikube is fine) with readiness and liveness probes.",
      level: "intermediate",
      requirements: [
        "Multi-stage Dockerfile; final image runs as a non-root user and is under ~100 MB",
        "A `.dockerignore` that keeps secrets, `.git` and `node_modules` out of the build context",
        "Separate `/healthz` (liveness) and `/readyz` (readiness) endpoints with different semantics",
        "Deployment with 2+ replicas, resource requests/limits, and a Service in front",
        "Demonstrate a rolling update with zero failed requests (e.g. a loop of curl calls during `kubectl rollout`)",
        "Handle SIGTERM: stop accepting new work, finish in-flight requests, exit within the grace period",
      ],
      stretch: [
        "Add an Ingress and route two paths to two services",
        "Add a HorizontalPodAutoscaler and load-test it",
        "Scan the image for vulnerabilities in CI",
      ],
      exercises: ["cloud/docker", "cloud/kubernetes", "system-design/health-checks-heartbeats", "go/graceful-shutdown"],
    },
    {
      id: "cloud-pipeline-ec2",
      title: "CI/CD pipeline to a VM",
      summary: "Build, test and ship a container image on every push to main and deploy it to an EC2 instance (or equivalent VM) behind a reverse proxy.",
      level: "intermediate",
      requirements: [
        "CI runs lint and tests on every pull request; merges are blocked on failure",
        "Images are tagged with the commit SHA (not only `latest`) and pushed to a registry",
        "Deployment uses short-lived credentials (OIDC federation or an instance role), not long-lived keys in the repo",
        "Security group allows only 80/443 publicly and SSH from your IP (or use SSM Session Manager)",
        "A documented rollback: redeploy the previous SHA",
      ],
      stretch: ["Put a CDN in front and set correct cache headers for static assets", "Blue/green switch with a health check gate"],
      exercises: ["cloud/ci-cd", "cloud/ec2-deployment", "cloud/cdn-cloudfront", "system-design/deployment-strategies"],
    },
  ],
  sources: [
    { label: "Docker docs", url: "https://docs.docker.com/", kind: "docs" },
    { label: "Docker: multi-stage builds", url: "https://docs.docker.com/build/building/multi-stage/", kind: "docs" },
    { label: "Kubernetes documentation — Concepts", url: "https://kubernetes.io/docs/concepts/", kind: "docs" },
    { label: "Linux man page: namespaces(7)", url: "https://man7.org/linux/man-pages/man7/namespaces.7.html", kind: "docs" },
    { label: "Linux man page: cgroups(7)", url: "https://man7.org/linux/man-pages/man7/cgroups.7.html", kind: "docs" },
    { label: "Amazon EC2 User Guide", url: "https://docs.aws.amazon.com/ec2/", kind: "docs" },
    { label: "Amazon CloudFront Developer Guide", url: "https://docs.aws.amazon.com/cloudfront/", kind: "docs" },
    { label: "Cloudflare Workers docs", url: "https://developers.cloudflare.com/workers/", kind: "docs" },
    { label: "GitHub Actions documentation", url: "https://docs.github.com/en/actions", kind: "docs" },
  ],
};

export const lessons: Lesson[] = [
  {
    slug: "docker",
    track: "cloud",
    title: "Docker: images, layers, namespaces and cgroups",
    summary:
      "A container is an ordinary Linux process isolated by namespaces, limited by cgroups and given a layered filesystem from an image. Learn how images are built, cached and kept small with multi-stage builds.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 45,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["os/processes-threads", "os/virtual-memory"],
    related: ["cloud/kubernetes", "cloud/ci-cd", "production/build-performance"],
    tags: ["docker", "containers", "namespaces", "cgroups", "images", "dockerfile", "multi-stage"],
    sources: [
      { label: "Docker docs: What is a container?", url: "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/", kind: "docs" },
      { label: "Docker docs: Build cache", url: "https://docs.docker.com/build/cache/", kind: "docs" },
      { label: "Docker docs: Multi-stage builds", url: "https://docs.docker.com/build/building/multi-stage/", kind: "docs" },
      { label: "Docker docs: Storage drivers (overlay2)", url: "https://docs.docker.com/engine/storage/drivers/", kind: "docs" },
      { label: "namespaces(7)", url: "https://man7.org/linux/man-pages/man7/namespaces.7.html", kind: "docs" },
      { label: "cgroups(7)", url: "https://man7.org/linux/man-pages/man7/cgroups.7.html", kind: "docs" },
      { label: "OCI Image Format Specification", url: "https://github.com/opencontainers/image-spec", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what a container is in terms of Linux primitives: namespaces, cgroups and a union filesystem",
              "Distinguish image, layer, container and registry, and explain the difference from a virtual machine",
              "Write a Dockerfile that uses the build cache well and a multi-stage build that produces a small, non-root image",
              "Reason about PID 1, signals, and why `docker stop` sometimes takes 10 seconds",
            ],
          },
        ],
      },
      {
        id: "prerequisites",
        blocks: [
          { type: "p", text: "You should know what a process is (see the OS lesson on processes and threads) and be comfortable in a shell. Kernel knowledge is not required — we define each primitive as we go." },
        ],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "Think of a container as a process wearing blinkers. It runs on the *same kernel* as every other process on the host, but the kernel lies to it: it sees its own process list, its own network interfaces, its own hostname and its own root filesystem. A separate kernel feature puts a fence around how much CPU and memory it may use." },
          { type: "p", text: "An **image** is the packed lunch you hand that process: a stack of read-only filesystem snapshots plus metadata (default command, env vars, user). Ship the image anywhere with a compatible kernel and CPU architecture, and the process sees the same files." },
          { type: "callout", tone: "misconception", title: "\"A container is a lightweight VM\"", text: "A VM runs its own kernel on virtualized hardware. A container shares the host kernel — there is no guest OS booting. This is why containers start in milliseconds, and also why a kernel exploit can escape a container more easily than a hypervisor boundary." },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Term", "What it is"],
            rows: [
              ["Image", "An immutable, content-addressed bundle: an ordered list of filesystem layers + a config (entrypoint, env, user, exposed ports). Described by the OCI image spec."],
              ["Layer", "A tarball of filesystem changes (added/modified/deleted files) produced by one build step. Identified by the SHA-256 digest of its content."],
              ["Container", "A running (or stopped) process created from an image, with a thin writable layer on top of the image's read-only layers."],
              ["Registry", "A server that stores and serves images by name, tag and digest (Docker Hub, ECR, GCR/Artifact Registry, GHCR)."],
              ["Namespace", "A kernel feature that gives a process its own view of a global resource (PIDs, network, mounts, hostname, IPC, users, cgroups)."],
              ["cgroup", "Control group: a kernel feature that accounts for and limits CPU, memory, I/O and PIDs for a group of processes."],
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
              "**Reproducibility** — the same image digest runs identically in CI, staging and production; \"works on my machine\" shrinks to kernel/arch differences.",
              "**Density and speed** — no guest OS, so dozens of containers fit where a few VMs would, and they start in well under a second.",
              "**A standard unit for orchestration** — Kubernetes, ECS, Cloud Run and Fly all consume OCI images.",
              "**Dependency isolation** — two services can need different Python or OpenSSL versions on the same host.",
            ],
          },
        ],
      },
      {
        id: "internals",
        blocks: [
          { type: "p", text: "`docker run` is a thin client. The Docker daemon (`dockerd`) asks **containerd** to manage the container, which uses a low-level OCI runtime (by default **runc**) to make the actual kernel calls. runc creates the namespaces, configures cgroups, mounts the root filesystem and `exec`s your process." },
          { type: "flow", nodes: ["docker CLI", "dockerd (API)", "containerd", "containerd-shim", "runc", "your process"], caption: "Conceptual call chain for `docker run` on Linux." },
          { type: "p", text: "**Namespaces** provide isolation of *what a process can see*:" },
          {
            type: "table",
            head: ["Namespace", "Isolates", "Effect inside the container"],
            rows: [
              ["pid", "Process IDs", "Your process is PID 1 and cannot see host processes"],
              ["net", "Network stack", "Own interfaces, routing table, ports (a veth pair connects it to a bridge)"],
              ["mnt", "Mount points", "Own root filesystem (the image layers)"],
              ["uts", "Hostname", "Own hostname (defaults to the container ID)"],
              ["ipc", "SysV IPC / POSIX queues", "Shared memory isolated from other containers"],
              ["user", "UID/GID mapping", "Root inside can map to an unprivileged UID outside (rootless mode)"],
              ["cgroup", "cgroup tree view", "Sees its own cgroup as the root"],
            ],
          },
          { type: "p", text: "**cgroups** provide limits on *how much a process can use*. `--memory=256m` writes a limit into the container's cgroup; if the processes exceed it, the kernel's OOM killer kills one inside that cgroup (exit code 137 = 128 + SIGKILL). `--cpus=0.5` sets a CFS quota: the group may use 50 ms of CPU time every 100 ms period, and is throttled beyond that." },
          { type: "p", text: "**Union filesystem.** With the default `overlay2` storage driver, the image layers are stacked as read-only *lower* directories and the container gets one writable *upper* directory. Reads fall through to the topmost layer that has the file. The first write to an existing file copies it up into the upper layer (**copy-on-write**). Deleting a file from a lower layer writes a *whiteout* marker — the bytes still exist in the image." },
          { type: "callout", tone: "spec-vs-impl", title: "Linux-specific", text: "Namespaces, cgroups and overlayfs are Linux kernel features. Docker Desktop on macOS and Windows runs a small Linux VM and your containers run inside it — which is why bind-mount file I/O is slower there. Windows containers are a separate implementation. cgroup v2 (unified hierarchy) is the default on modern distros; older hosts use cgroup v1 with different file layouts." },
          { type: "p", text: "**Build cache.** Each Dockerfile instruction produces a layer. The builder (BuildKit, default since Docker Engine 23.0) reuses a cached layer if the instruction and its inputs are unchanged — for `COPY`/`ADD` that means the checksums of the copied files. Once one step misses the cache, every later step is rebuilt. Hence the rule: put rarely-changing steps (installing dependencies) before frequently-changing steps (copying source)." },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a cache-friendly multi-stage build",
        blocks: [
          {
            type: "code",
            lang: "text",
            caption: "Dockerfile for a Node.js service. The final image contains only runtime deps and built output.",
            code: `# syntax=docker/dockerfile:1
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`,
          },
          {
            type: "steps",
            steps: [
              { title: "Stage `deps`", detail: "Copies only the manifest and lockfile, then installs. This layer is cached until the lockfile changes, so editing source code does not reinstall dependencies." },
              { title: "Stage `build`", detail: "Copies the source (cache miss on every code change, but only from here on), compiles, and removes dev dependencies." },
              { title: "Stage `runtime`", detail: "Starts again from a clean base. `COPY --from=build` pulls in only the artifacts. Compilers, dev deps, source and any build secrets never reach the final image." },
              { title: "`USER node`", detail: "The official Node image ships a non-root `node` user. Running as non-root limits the blast radius if the app is compromised." },
              { title: "Exec-form `CMD`", detail: "The JSON array form runs `node` directly as PID 1, so it receives SIGTERM from `docker stop`. The shell form (`CMD node dist/server.js`) wraps it in `/bin/sh -c`, which may not forward signals." },
            ],
          },
          {
            type: "code",
            lang: "bash",
            caption: "Build, run with limits, and inspect.",
            code: `docker build -t myapp:1.0 .
docker run -d --name myapp -p 8080:3000 --memory=256m --cpus=0.5 myapp:1.0
docker history myapp:1.0        # one row per layer, with sizes
docker inspect --format '{{.State.Pid}}' myapp   # the container's PID as seen by the host
docker stats --no-stream myapp  # live cgroup accounting`,
          },
        ],
      },
      {
        id: "examples",
        blocks: [
          { type: "p", text: "Seeing that a container is \"just a process\": on a Linux host, the container's process appears in the host's `ps` output with a normal host PID, while inside the container it is PID 1." },
          {
            type: "code",
            lang: "bash",
            code: `docker run -d --name sleeper alpine sleep 1000
docker exec sleeper ps         # inside: sleep is PID 1
ps -ef | grep "sleep 1000"     # on the host: same process, ordinary host PID`,
          },
          { type: "p", text: "A `.dockerignore` keeps the build context small and secrets out of layers:" },
          {
            type: "code",
            lang: "text",
            code: `.git
node_modules
dist
.env
*.log`,
          },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**PID 1 is special.** The kernel does not apply default signal handlers to PID 1 in a namespace, so a process that does not install a SIGTERM handler ignores it. `docker stop` then waits the grace period (10 s by default) and sends SIGKILL. Fix: handle SIGTERM, or run with `--init` (tini) which forwards signals and reaps zombies.",
              "**Deleting in a later layer does not shrink the image.** `RUN rm big.tar` after `COPY big.tar` leaves the bytes in the earlier layer. Delete in the same `RUN`, or use a multi-stage build.",
              "**Secrets in `ENV`/`ARG` or copied files are recoverable** from `docker history` or layer tarballs. Use BuildKit secret mounts (`RUN --mount=type=secret,...`) instead.",
              "**Architecture mismatch.** An `amd64` image will not run natively on an `arm64` host (e.g. Apple Silicon, Graviton). Build multi-platform images with `docker buildx build --platform linux/amd64,linux/arm64`.",
              "**`latest` is just a tag**, not \"newest\". It is mutable; pin by version or digest (`image@sha256:...`) for reproducible deploys.",
              "**Container writable layer is ephemeral.** Data written there disappears when the container is removed. Use volumes for state.",
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
              "`COPY . .` before installing dependencies — busts the cache on every code change.",
              "Running as root \"because it works\".",
              "Using a full OS image (hundreds of MB) when a slim or distroless base suffices.",
              "Treating the container as a VM: running sshd, cron and the app in one container, or patching it in place instead of rebuilding.",
              "Not setting memory limits, then being surprised when one container starves the host — or setting them too low and getting exit code 137.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Containers", points: ["Shared host kernel — weaker isolation boundary", "Start in milliseconds, MBs of overhead", "Image is the app + userland only", "Must match host kernel family and CPU arch"] },
              { title: "Virtual machines", points: ["Own kernel on a hypervisor — stronger isolation", "Boot in seconds to minutes, GBs of overhead", "Image includes a whole OS", "Can run a different OS than the host"] },
            ],
          },
          { type: "p", text: "Middle grounds exist: **gVisor** intercepts syscalls in a user-space kernel, and **Firecracker** microVMs (used by AWS Lambda and Fargate) give VM isolation with near-container startup." },
          {
            type: "table",
            head: ["Base image", "Pros", "Cons"],
            rows: [
              ["Full distro (e.g. `debian`)", "Every tool available, easy debugging", "Large, more CVEs to patch"],
              ["Slim (`*-slim`)", "Much smaller, still has a shell and package manager", "Some native libs missing"],
              ["Alpine", "Very small", "musl libc instead of glibc — subtle incompatibilities with some native modules and DNS behaviour"],
              ["Distroless / `scratch`", "Minimal attack surface (no shell)", "Harder to debug; `scratch` needs a static binary (great for Go)"],
            ],
          },
        ],
      },
      {
        id: "real-world",
        blocks: [
          { type: "p", text: "In CI, images are typically built once per commit, tagged with the git SHA, scanned (Trivy, Grype, registry scanning) and pushed to a registry. The *same digest* is promoted from staging to production — rebuilding for each environment defeats reproducibility. Kubernetes then pulls the image onto nodes; see the Kubernetes lesson." },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          { type: "p", text: "\"A container is a regular Linux process that the kernel isolates with namespaces — its own PID tree, network stack, mounts and hostname — and constrains with cgroups for CPU, memory and I/O. Its filesystem comes from an image: a stack of read-only content-addressed layers combined by overlayfs, with a thin copy-on-write layer on top. Unlike a VM there's no guest kernel, so it's fast and dense but the isolation boundary is weaker. In Dockerfiles I order steps so dependency installation is cached, use multi-stage builds to ship only runtime artifacts, and run as non-root.\"" },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Explain the runtime chain: CLI → dockerd → containerd → shim → runc, and that Kubernetes talks to containerd directly through the CRI (dockershim was removed in Kubernetes 1.24).",
              "Explain copy-on-write and whiteouts, and why `RUN apt-get update && apt-get install ... && rm -rf /var/lib/apt/lists/*` is one instruction.",
              "Explain why exit code 137 means OOM-kill (or any SIGKILL), and how cgroup memory limits interact with language runtimes (e.g. older JVMs ignoring cgroup limits; Node's heap size is not automatically the container limit in all versions).",
              "Discuss image supply chain: pinning digests, signing (cosign/Notary), SBOMs, scanning.",
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
              "Container = process + namespaces (what it sees) + cgroups (what it may use) + layered root filesystem.",
              "Image = immutable, content-addressed layers + config; container = image + writable layer.",
              "Order Dockerfile steps from least to most frequently changing; use multi-stage builds; run as non-root.",
              "Exec-form CMD and a SIGTERM handler (or `--init`) for clean shutdowns.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "OCI", definition: "Open Container Initiative — the vendor-neutral specs for image format, runtime and distribution that Docker, containerd, Podman and Kubernetes all implement." },
      { term: "runc", definition: "The reference low-level OCI runtime that creates namespaces and cgroups and starts the container process." },
      { term: "containerd", definition: "A container runtime daemon that manages images, storage and container lifecycle; used by Docker and directly by Kubernetes via CRI." },
      { term: "overlayfs / overlay2", definition: "A Linux union filesystem that merges read-only lower directories with a writable upper directory; Docker's default storage driver." },
      { term: "Copy-on-write", definition: "A file from a lower layer is copied into the writable layer only when the container first modifies it." },
      { term: "Whiteout", definition: "A marker file in an upper layer that hides a file from a lower layer, representing deletion." },
      { term: "Build context", definition: "The set of files sent to the builder for `COPY`/`ADD`, filtered by `.dockerignore`." },
      { term: "Multi-stage build", definition: "A Dockerfile with multiple `FROM` stages where later stages copy selected artifacts from earlier ones." },
      { term: "Distroless", definition: "Base images containing only the app's runtime dependencies — no shell or package manager." },
    ],
    followUps: [
      { q: "Why does `docker stop` sometimes take exactly 10 seconds?", a: "Docker sends SIGTERM, waits the grace period (10 s default), then SIGKILL. If the app is PID 1 without a SIGTERM handler, or is wrapped by a shell that does not forward signals, SIGTERM is effectively ignored and you hit the timeout. Use exec-form CMD, handle SIGTERM, or add `--init`." },
      { q: "Two images share the same base. Is the base stored twice on the host?", a: "No. Layers are content-addressed by digest, so identical layers are stored and pulled once and shared by all images and containers that reference them." },
      { q: "Can a container see host processes?", a: "Not by default — it is in its own PID namespace. Running with `--pid=host` shares the host PID namespace, which is a deliberate weakening of isolation." },
      { q: "What happens if a container exceeds its CPU limit vs its memory limit?", a: "CPU is compressible: the cgroup is throttled (it waits until the next CFS period). Memory is not compressible: the kernel OOM-kills a process in the cgroup." },
      { q: "Is root inside a container root on the host?", a: "Without user namespaces, UID 0 inside is UID 0 on the host, constrained by dropped capabilities, seccomp and AppArmor/SELinux profiles. With rootless mode or userns-remap, container root maps to an unprivileged host UID." },
    ],
    quiz: [
      {
        id: "docker-q1",
        prompt: "Which kernel feature limits how much memory a container may use?",
        options: ["Mount namespace", "cgroups", "overlayfs", "seccomp"],
        answer: 1,
        explanation: "cgroups account for and limit resources. Namespaces isolate what a process can see; overlayfs provides the layered filesystem; seccomp filters syscalls.",
      },
      {
        id: "docker-q2",
        prompt: "A Dockerfile has `COPY big.zip /tmp/` then `RUN unzip /tmp/big.zip && rm /tmp/big.zip`. Is big.zip's size in the final image?",
        options: ["No, it was deleted", "Yes, it remains in the COPY layer", "Only if BuildKit is disabled", "Only on overlay2"],
        answer: 1,
        explanation: "Each instruction creates an immutable layer. The `rm` in a later layer only adds a whiteout; the bytes stay in the earlier layer. Use a multi-stage build or download+extract+delete in one RUN.",
      },
      {
        id: "docker-q3",
        prompt: "A container exits with code 137. The most likely cause?",
        options: ["Syntax error in the app", "It received SIGKILL, often from the OOM killer", "Port already in use", "Image not found"],
        answer: 1,
        explanation: "137 = 128 + 9 (SIGKILL). Common causes are exceeding the cgroup memory limit or `docker stop`/Kubernetes killing it after the grace period.",
      },
    ],
  },
  {
    slug: "kubernetes",
    track: "cloud",
    title: "Kubernetes: pods, deployments, services, ingress, probes and scheduling",
    summary:
      "Kubernetes is a control loop that keeps the cluster's actual state matching the desired state you declare. Learn the core objects, how traffic reaches a pod, how probes drive restarts and rollouts, and how the scheduler places pods.",
    level: "intermediate",
    frequency: "very-high",
    minutes: 60,
    kinds: ["theory", "visualization", "system-design"],
    status: "authored",
    prerequisites: ["cloud/docker", "networks/dns", "networks/http"],
    related: [
      "system-design/health-checks-heartbeats",
      "system-design/deployment-strategies",
      "system-design/service-discovery",
      "system-design/load-balancing-algorithms",
      "go/graceful-shutdown",
    ],
    tags: ["kubernetes", "k8s", "pods", "deployments", "services", "ingress", "probes", "scheduler", "control-plane"],
    sources: [
      { label: "Kubernetes: Cluster architecture", url: "https://kubernetes.io/docs/concepts/architecture/", kind: "docs" },
      { label: "Kubernetes: Pods", url: "https://kubernetes.io/docs/concepts/workloads/pods/", kind: "docs" },
      { label: "Kubernetes: Deployments", url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/", kind: "docs" },
      { label: "Kubernetes: Service", url: "https://kubernetes.io/docs/concepts/services-networking/service/", kind: "docs" },
      { label: "Kubernetes: Ingress", url: "https://kubernetes.io/docs/concepts/services-networking/ingress/", kind: "docs" },
      { label: "Kubernetes: Gateway API", url: "https://kubernetes.io/docs/concepts/services-networking/gateway/", kind: "docs" },
      { label: "Kubernetes: Configure liveness, readiness and startup probes", url: "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/", kind: "docs" },
      { label: "Kubernetes: Scheduler", url: "https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/", kind: "docs" },
      { label: "Kubernetes: Resource management for pods and containers", url: "https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/", kind: "docs" },
      { label: "Kubernetes: Pod lifecycle — termination", url: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Describe the control plane (API server, etcd, scheduler, controller manager) and node components (kubelet, kube-proxy, container runtime)",
              "Explain the reconciliation loop and why Kubernetes is declarative",
              "Use Pods, Deployments/ReplicaSets, Services and Ingress, and trace a request from the internet to a container",
              "Configure liveness, readiness and startup probes correctly, and explain what each one triggers",
              "Explain how requests, limits, affinity and taints influence scheduling",
            ],
          },
        ],
      },
      {
        id: "prerequisites",
        blocks: [
          { type: "p", text: "Know what a container image is (the Docker lesson) and the basics of DNS and HTTP. YAML familiarity helps." },
        ],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "Imagine a thermostat. You don't tell it \"turn the heater on for 12 minutes\" — you tell it \"I want 21 °C\" and it keeps comparing the room to that number and acting. Kubernetes works the same way: you submit the *desired state* (\"3 replicas of image X, reachable at name `api`\") and a set of **controllers** continuously compare it to the *actual state* and act to close the gap." },
          { type: "p", text: "If a node dies and takes two pods with it, nobody runs a script: the ReplicaSet controller notices 1 ≠ 3 and creates two more, and the scheduler places them on healthy nodes." },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Object", "Purpose"],
            rows: [
              ["Pod", "The smallest deployable unit: one or more containers sharing a network namespace (one IP, localhost between them) and volumes. Pods are ephemeral and replaceable."],
              ["ReplicaSet", "Keeps N identical pods running, selected by labels."],
              ["Deployment", "Manages ReplicaSets to give declarative rolling updates and rollbacks for stateless apps."],
              ["StatefulSet", "Like a Deployment but with stable identities (`db-0`, `db-1`), ordered rollout and per-pod persistent volumes."],
              ["DaemonSet", "Runs one pod per (matching) node — log shippers, node agents."],
              ["Service", "A stable virtual IP and DNS name that load-balances to the pods matching a label selector."],
              ["Ingress", "HTTP(S) routing rules (host/path → Service), implemented by an ingress controller (e.g. ingress-nginx, Traefik, a cloud LB controller)."],
              ["ConfigMap / Secret", "Configuration and sensitive values injected as env vars or files. Secrets are base64-encoded, not encrypted, unless encryption at rest is configured."],
              ["Namespace", "A logical partition of the cluster for names, quotas and RBAC (not the Linux kernel namespace)."],
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
              "**Self-healing** — crashed containers restart, failed nodes' pods are rescheduled, unready pods are removed from load balancing.",
              "**Declarative, versionable config** — manifests live in git; the cluster converges to them (the basis of GitOps).",
              "**Bin-packing** — the scheduler fits workloads onto nodes based on declared resource requests.",
              "**Portable abstractions** — Service, Ingress, volumes and autoscaling work similarly across EKS, GKE, AKS and on-prem.",
            ],
          },
          { type: "callout", tone: "note", title: "When not to use it", text: "Kubernetes has real operational cost. A handful of services can often run more cheaply and simply on a PaaS, serverless containers (Cloud Run, ECS Fargate) or plain VMs." },
        ],
      },
      {
        id: "internals",
        blocks: [
          {
            type: "steps",
            steps: [
              { title: "API server", detail: "The only component that talks to etcd. Every client (kubectl, controllers, kubelets) reads and writes objects through its REST API, with authentication, authorization (RBAC) and admission control." },
              { title: "etcd", detail: "A strongly consistent key-value store (it uses Raft consensus) holding all cluster state. Lose etcd without a backup and you lose the cluster's desired state." },
              { title: "Controllers (kube-controller-manager)", detail: "Loops that *watch* objects via the API server and reconcile: Deployment → ReplicaSet → Pods, node lifecycle, endpoints, jobs." },
              { title: "Scheduler", detail: "Watches for pods with no `nodeName`. For each, it **filters** nodes that can fit it (resources, taints, affinity, ports) and **scores** the rest, then *binds* the pod to the best node." },
              { title: "kubelet (on each node)", detail: "Watches for pods bound to its node, asks the container runtime (containerd/CRI-O via CRI) to start them, runs probes, and reports status." },
              { title: "kube-proxy / CNI", detail: "The CNI plugin gives each pod an IP routable across the cluster. kube-proxy (or an eBPF replacement like Cilium) programs iptables/IPVS rules so a Service's virtual IP is load-balanced to ready pod IPs." },
            ],
          },
          { type: "flow", nodes: ["kubectl apply", "API server", "etcd", "Deployment controller", "ReplicaSet controller", "Scheduler", "kubelet", "containerd"], caption: "Conceptual: what happens after you apply a Deployment. Each arrow is really a watch on the API server, not a direct call." },
          { type: "p", text: "**How a Service routes.** A Service with selector `app: api` gets a ClusterIP. The EndpointSlice controller tracks the IPs of pods that match the selector *and are Ready*. kube-proxy turns that into packet-level rules on every node. Cluster DNS (CoreDNS) resolves `api.<namespace>.svc.cluster.local` to the ClusterIP." },
          {
            type: "table",
            head: ["Service type", "Reachable from", "Typical use"],
            rows: [
              ["ClusterIP (default)", "Inside the cluster only", "Service-to-service calls"],
              ["NodePort", "Every node's IP on a high port (30000–32767 by default)", "Simple external access, or a target for an external LB"],
              ["LoadBalancer", "A cloud load balancer provisioned by the cloud controller", "Exposing one service directly"],
              ["Headless (`clusterIP: None`)", "DNS returns pod IPs directly", "StatefulSets, client-side load balancing"],
            ],
          },
        ],
      },
      {
        id: "visualization",
        title: "From the internet to a pod",
        blocks: [
          { type: "p", text: "An Ingress is one hop in the general request path. In a cluster the \"load balancer\" step is a cloud LB in front of the ingress controller, which routes by host/path to a Service, which picks a ready pod." },
          { type: "viz", id: "sys-request-flow", caption: "General request flow. In Kubernetes, the LB → app hop expands to: cloud LB → ingress controller pod → Service (ClusterIP) → ready pod endpoint." },
          { type: "flow", nodes: ["Client", "DNS", "Cloud load balancer", "Ingress controller", "Service (ClusterIP)", "Pod (Ready)"], caption: "Conceptual Kubernetes ingress path. TLS is usually terminated at the cloud LB or the ingress controller." },
          { type: "callout", tone: "spec-vs-impl", title: "Ingress is only a spec", text: "The Ingress object does nothing without an ingress controller installed; behaviour (annotations, timeouts, rewrites) varies by controller. The newer **Gateway API** (GA in 2023, v1.0) is the more expressive successor and is recommended for new setups." },
        ],
      },
      {
        id: "walkthrough",
        title: "Walkthrough: a Deployment with probes behind a Service and Ingress",
        blocks: [
          {
            type: "code",
            lang: "yaml",
            code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  template:
    metadata:
      labels: { app: api }
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: registry.example.com/api:3f2c1ab
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: 250m, memory: 256Mi }
            limits:   { memory: 256Mi }
          startupProbe:
            httpGet: { path: /healthz, port: 3000 }
            periodSeconds: 5
            failureThreshold: 24     # up to 120 s to start
          livenessProbe:
            httpGet: { path: /healthz, port: 3000 }
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet: { path: /readyz, port: 3000 }
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 3000 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
spec:
  ingressClassName: nginx
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: api, port: { number: 80 } }`,
          },
          {
            type: "steps",
            steps: [
              { title: "Apply", detail: "`kubectl apply -f api.yaml` stores three objects. The Deployment controller creates a ReplicaSet for this pod template hash; the ReplicaSet creates 3 pods." },
              { title: "Schedule", detail: "The scheduler finds nodes with at least 250m CPU and 256Mi memory *unrequested* (requests, not actual usage), and binds each pod." },
              { title: "Start", detail: "kubelet pulls the image and starts the container. Until the startup probe passes, liveness and readiness probes are not run." },
              { title: "Become ready", detail: "When `/readyz` succeeds the pod is marked Ready and its IP is added to the Service's EndpointSlice — only now does it receive traffic." },
              { title: "Roll out a new image", detail: "Changing the image creates a new ReplicaSet. With `maxSurge: 1, maxUnavailable: 0`, Kubernetes adds one new pod, waits for it to be Ready, then removes one old pod, and repeats." },
              { title: "Terminate old pods", detail: "A terminating pod is removed from endpoints and receives SIGTERM concurrently; after `terminationGracePeriodSeconds` it gets SIGKILL. Apps should finish in-flight requests and exit." },
            ],
          },
        ],
      },
      {
        id: "examples",
        title: "Probes: what each one triggers",
        blocks: [
          {
            type: "table",
            head: ["Probe", "Question it answers", "On failure", "Good check"],
            rows: [
              ["Startup", "Has the app finished starting?", "Container is restarted after `failureThreshold` failures; other probes are held off until it passes", "Same cheap endpoint as liveness, with a generous threshold"],
              ["Liveness", "Is the process stuck beyond recovery?", "kubelet **restarts** the container", "In-process check only (event loop responsive, no deadlock). Never check the database here."],
              ["Readiness", "Should this pod receive traffic right now?", "Pod is **removed from Service endpoints** (not restarted)", "Can serve: warmed up, critical dependencies reachable, not overloaded/draining"],
            ],
          },
          { type: "callout", tone: "warning", title: "The cascading-restart trap", text: "If the liveness probe checks the database and the database blips, *every* pod fails liveness at once and Kubernetes restarts the whole fleet — turning a dependency hiccup into a full outage. Dependency checks belong in readiness (and even there, consider whether failing all pods helps)." },
        ],
      },
      {
        id: "edge-cases",
        blocks: [
          {
            type: "list",
            items: [
              "**Requests vs limits.** The scheduler only looks at *requests*. A CPU limit causes throttling; a memory limit causes OOM-kill (`OOMKilled`, exit 137). Many teams set memory limit = request and omit CPU limits to avoid throttling latency.",
              "**QoS classes.** Pods with requests = limits for all resources are `Guaranteed`; with some requests are `Burstable`; with none are `BestEffort` — evicted first under node memory pressure.",
              "**Termination race.** Endpoint removal and SIGTERM happen in parallel, so a few requests can still arrive after SIGTERM. A short `preStop` sleep or continuing to serve for a few seconds after SIGTERM avoids 502s.",
              "**CrashLoopBackOff** means the container keeps exiting; kubelet restarts it with exponential back-off (capped at 5 minutes). Check `kubectl logs --previous`.",
              "**Pending pods** usually mean no node satisfies requests, taints or affinity — `kubectl describe pod` shows the scheduler's reasons.",
              "**Secrets are not encrypted by default** in etcd; enable encryption at rest and restrict RBAC.",
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
              "Using the same endpoint and semantics for liveness and readiness.",
              "Deploying with the `latest` tag — the Deployment's pod template does not change, so no rollout happens, and nodes may run different images.",
              "No resource requests: the scheduler packs pods blindly, and they are first to be evicted.",
              "Running stateful databases in Deployments with shared volumes instead of StatefulSets (or a managed database).",
              "Ignoring SIGTERM, so every deploy drops in-flight requests.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Kubernetes", points: ["Rich, portable abstractions and huge ecosystem", "Self-healing, rolling updates, autoscaling", "Significant learning curve and operational surface (upgrades, networking, RBAC)", "Managed control planes (EKS/GKE/AKS) reduce but do not remove the burden"] },
              { title: "Serverless containers / PaaS (Cloud Run, Fargate, App Runner)", points: ["Deploy an image, get a URL; scale to zero possible", "Far less to operate", "Less control over networking, sidecars, scheduling", "Per-request pricing can be costlier at high steady load"] },
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
              "Horizontal Pod Autoscaler scales replicas on CPU/memory or custom metrics; Cluster Autoscaler or Karpenter adds nodes when pods are Pending.",
              "PodDisruptionBudgets keep a minimum number of replicas available during node drains and upgrades.",
              "GitOps tools (Argo CD, Flux) continuously reconcile the cluster to manifests in git.",
              "Helm and Kustomize template and patch manifests per environment.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          { type: "p", text: "\"Kubernetes is a declarative system: you store desired state in the API server, backed by etcd, and controllers continuously reconcile actual state toward it. Pods are the unit of scheduling; Deployments manage ReplicaSets for rolling updates; a Service gives a stable virtual IP and DNS name that load-balances across *ready* pods; an Ingress, implemented by a controller, routes external HTTP by host and path to Services. The scheduler filters and scores nodes based on resource requests, taints and affinity. Liveness failures restart a container; readiness failures only take it out of load balancing; startup probes protect slow starters.\"" },
        ],
      },
      {
        id: "interview-deep",
        blocks: [
          {
            type: "list",
            items: [
              "Trace `kubectl apply` through API server admission, etcd write, controller watches, scheduling, kubelet and CRI.",
              "Explain zero-downtime deploys end to end: readiness gating, `maxUnavailable: 0`, SIGTERM handling, preStop delay, PodDisruptionBudgets.",
              "Discuss why etcd needs an odd number of members (3 or 5) — Raft majority quorum = floor(n/2)+1.",
              "Compare kube-proxy iptables vs IPVS vs eBPF dataplanes at scale.",
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
              "Desired state in etcd via the API server; controllers reconcile; scheduler binds pods to nodes; kubelet runs them.",
              "Deployment → ReplicaSet → Pods; Service → ready pod endpoints; Ingress/Gateway → Services.",
              "Liveness restarts, readiness removes from traffic, startup delays the others.",
              "Scheduling uses requests; limits enforce throttling (CPU) or OOM-kill (memory).",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Control plane", definition: "The components that manage cluster state: API server, etcd, scheduler and controller manager." },
      { term: "Reconciliation loop", definition: "A controller's cycle of observing actual state, comparing to desired state and acting to converge." },
      { term: "kubelet", definition: "The node agent that starts pods via the container runtime, runs probes and reports status." },
      { term: "EndpointSlice", definition: "An object listing the IPs and ports of ready pods behind a Service." },
      { term: "Ingress controller", definition: "A proxy running in the cluster that implements Ingress rules (e.g. ingress-nginx)." },
      { term: "Probe", definition: "A periodic HTTP, TCP, gRPC or exec check kubelet runs against a container." },
      { term: "Taint / toleration", definition: "A node taint repels pods unless they carry a matching toleration — used to dedicate nodes." },
      { term: "Affinity", definition: "Rules attracting (or repelling) pods to nodes or to other pods by labels." },
      { term: "CrashLoopBackOff", definition: "Pod status when a container repeatedly exits and kubelet backs off between restarts." },
    ],
    followUps: [
      { q: "What is the difference between a liveness and a readiness probe failure?", a: "Liveness failure makes kubelet restart the container. Readiness failure removes the pod from Service endpoints so it gets no traffic, but leaves it running so it can recover." },
      { q: "Why might a rolling update still drop requests?", a: "Pods without a readiness probe receive traffic before they are ready; old pods may be killed before draining because SIGTERM and endpoint removal race; or the app ignores SIGTERM. Fix with readiness probes, `maxUnavailable: 0`, a preStop delay and graceful shutdown." },
      { q: "A pod is stuck in Pending. How do you debug it?", a: "`kubectl describe pod` and read Events: insufficient CPU/memory requests, untolerated taints, unsatisfiable affinity, or an unbound PersistentVolumeClaim. Then fix requests, add nodes or adjust constraints." },
      { q: "Why do two containers in one pod talk over localhost?", a: "Containers in a pod share one network namespace (and IP), so they see the same loopback interface. That is what makes sidecars possible." },
      { q: "Where does a Service's virtual IP actually live?", a: "Nowhere as an interface — it exists as rules (iptables/IPVS/eBPF) programmed on every node that DNAT traffic for the ClusterIP to one of the ready pod IPs." },
    ],
    quiz: [
      {
        id: "k8s-q1",
        prompt: "Your liveness probe checks database connectivity. The database is down for 60 seconds. What happens?",
        options: ["Nothing; probes ignore dependencies", "Pods are removed from load balancing only", "All pods are restarted repeatedly, possibly causing a wider outage", "The Deployment is rolled back"],
        answer: 2,
        explanation: "Liveness failure restarts containers. Because every pod shares the dependency, all fail at once and restart, which does not fix the database and adds load and downtime.",
      },
      {
        id: "k8s-q2",
        prompt: "Which value does the scheduler use to decide whether a pod fits on a node?",
        options: ["The container's limits", "The container's requests", "Current actual CPU usage", "The image size"],
        answer: 1,
        explanation: "Scheduling is based on the sum of requests on the node vs its allocatable capacity, not live usage or limits.",
      },
      {
        id: "k8s-q3",
        prompt: "You create an Ingress resource but no traffic reaches your Service. What is a likely cause?",
        options: ["Ingress only works with NodePort services", "No ingress controller is installed (or the ingressClassName doesn't match one)", "Services cannot be reached from Ingress", "Pods need a public IP"],
        answer: 1,
        explanation: "Ingress is only a specification; a controller must watch it and configure a proxy. Without a matching controller nothing happens.",
      },
    ],
  },
  {
    slug: "cloud-providers",
    track: "cloud",
    title: "Cloud providers: mapping AWS, GCP and Azure core services",
    summary:
      "The big three clouds offer the same building blocks under different names. Learn the categories (compute, storage, databases, networking, identity, messaging) and the rough equivalents so you can read any architecture diagram.",
    level: "beginner",
    frequency: "high",
    minutes: 25,
    kinds: ["theory"],
    status: "authored",
    prerequisites: ["cloud/docker"],
    related: ["cloud/ec2-deployment", "cloud/kubernetes", "cloud/cdn-cloudfront", "system-design/vertical-vs-horizontal-scaling"],
    tags: ["aws", "gcp", "azure", "cloud", "iam", "regions"],
    sources: [
      { label: "AWS: Regions and Availability Zones", url: "https://docs.aws.amazon.com/whitepapers/latest/get-started-documentdb/aws-regions-and-availability-zones.html", kind: "docs" },
      { label: "Google Cloud: Compare AWS and Azure services to Google Cloud", url: "https://cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison", kind: "docs" },
      { label: "Azure: Azure for AWS professionals", url: "https://learn.microsoft.com/en-us/azure/architecture/aws-professional/", kind: "docs" },
      { label: "AWS Shared Responsibility Model", url: "https://aws.amazon.com/compliance/shared-responsibility-model/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain regions, availability zones and the shared responsibility model",
              "Map the core compute, storage, database, networking, identity and messaging services across AWS, GCP and Azure",
              "Choose between IaaS, containers-as-a-service, PaaS and functions for a workload",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "A cloud provider rents you someone else's data centres through an API. Every provider sells the same few primitives — machines, disks, object storage, networks, managed databases, queues and an identity system to control who can call what. Once you know the categories, the brand names are a lookup table." },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "list",
            items: [
              "**Region** — a geographic area (e.g. `us-east-1`, `europe-west1`) containing multiple isolated data centres.",
              "**Availability zone (AZ)** — one or more data centres within a region with independent power and networking. Spreading across AZs survives a single-facility failure.",
              "**Shared responsibility** — the provider secures the infrastructure; you secure what you put on it (IAM policies, OS patches on VMs, network rules, data). The split shifts toward the provider as you move from VMs to managed services.",
            ],
          },
          {
            type: "table",
            head: ["Category", "AWS", "Google Cloud", "Azure"],
            rows: [
              ["Virtual machines", "EC2", "Compute Engine", "Virtual Machines"],
              ["Managed Kubernetes", "EKS", "GKE", "AKS"],
              ["Serverless containers", "ECS on Fargate, App Runner", "Cloud Run", "Container Apps"],
              ["Functions", "Lambda", "Cloud Run functions", "Azure Functions"],
              ["Object storage", "S3", "Cloud Storage", "Blob Storage"],
              ["Block storage", "EBS", "Persistent Disk", "Managed Disks"],
              ["Managed relational DB", "RDS, Aurora", "Cloud SQL, AlloyDB", "Azure Database for PostgreSQL/MySQL, Azure SQL"],
              ["Wide-column / document NoSQL", "DynamoDB", "Bigtable, Firestore", "Cosmos DB"],
              ["In-memory cache", "ElastiCache", "Memorystore", "Azure Cache for Redis"],
              ["Queue / pub-sub", "SQS, SNS, EventBridge", "Pub/Sub", "Service Bus, Event Grid"],
              ["Streaming", "Kinesis, MSK (Kafka)", "Pub/Sub, Managed Kafka", "Event Hubs"],
              ["Private network", "VPC", "VPC", "Virtual Network (VNet)"],
              ["Load balancer", "ELB (ALB/NLB)", "Cloud Load Balancing", "Load Balancer, Application Gateway"],
              ["CDN", "CloudFront", "Cloud CDN", "Azure Front Door"],
              ["DNS", "Route 53", "Cloud DNS", "Azure DNS"],
              ["Identity & access", "IAM", "IAM", "Microsoft Entra ID + Azure RBAC"],
              ["Secrets", "Secrets Manager, SSM Parameter Store", "Secret Manager", "Key Vault"],
              ["Container registry", "ECR", "Artifact Registry", "Container Registry (ACR)"],
              ["Metrics/logs", "CloudWatch", "Cloud Monitoring/Logging", "Azure Monitor"],
            ],
          },
          { type: "callout", tone: "spec-vs-impl", title: "Names change", text: "Products are renamed and merged regularly (e.g. Azure AD became Microsoft Entra ID; Google Cloud Functions was folded under Cloud Run). The equivalences are approximate — check each provider's current comparison page linked in sources." },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "table",
            head: ["Model", "You manage", "Good for"],
            rows: [
              ["IaaS (VMs)", "OS, runtime, scaling, patching", "Full control, legacy apps, special hardware"],
              ["Managed Kubernetes", "Workloads, node config, cluster add-ons", "Many services, portability, platform teams"],
              ["Serverless containers / PaaS", "Your image or code", "Most web services; small teams"],
              ["Functions", "Function code", "Event glue, spiky or low traffic; watch cold starts and execution limits"],
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
              "Deploying everything into a single AZ and calling it highly available.",
              "Long-lived access keys checked into repos or CI variables instead of roles/OIDC federation.",
              "Ignoring data egress costs — moving data *out* of a cloud or across regions is usually billed, ingress usually is not.",
              "Public S3 buckets / storage containers by accident.",
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          { type: "p", text: "\"All three clouds offer the same primitives: VMs (EC2/Compute Engine/Azure VMs), managed Kubernetes (EKS/GKE/AKS), object storage (S3/GCS/Blob), managed SQL, queues, VPCs, load balancers and IAM. I design across at least two availability zones in a region, use managed services where they remove undifferentiated operations, grant least-privilege IAM roles instead of static keys, and keep an eye on egress costs.\"" },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "Regions contain AZs; spread across AZs for availability.",
              "Same categories everywhere — learn the categories, then map names.",
              "Shared responsibility: the more managed the service, the less you patch.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Region", definition: "A geographic cluster of data centres offered by a cloud provider." },
      { term: "Availability zone", definition: "An isolated data centre (or group) inside a region with independent power and networking." },
      { term: "IAM", definition: "Identity and Access Management — policies that say which principals may perform which actions on which resources." },
      { term: "Egress", definition: "Data leaving a provider's network or region; typically billed per GB." },
    ],
    followUps: [
      { q: "How would you make a web app survive an AZ outage?", a: "Run instances or pods in at least two AZs behind a regional load balancer, use a multi-AZ managed database with automatic failover, and keep state out of instance disks (object storage, managed DB)." },
      { q: "Why prefer an IAM role to an access key?", a: "Roles issue short-lived, automatically rotated credentials bound to a workload; static keys can leak and remain valid until manually revoked." },
    ],
    quiz: [
      {
        id: "cloud-providers-q1",
        prompt: "Which is the closest GCP equivalent of AWS S3?",
        options: ["Persistent Disk", "Cloud Storage", "Filestore", "Bigtable"],
        answer: 1,
        explanation: "Cloud Storage is object storage. Persistent Disk is block storage (like EBS), Filestore is managed NFS, Bigtable is a wide-column database.",
      },
      {
        id: "cloud-providers-q2",
        prompt: "Under the shared responsibility model, who patches the guest OS on an EC2 instance?",
        options: ["AWS", "You, the customer", "Nobody — EC2 is serverless", "The hypervisor automatically"],
        answer: 1,
        explanation: "With IaaS the customer manages the guest OS. AWS is responsible for the physical hosts and hypervisor.",
      },
    ],
  },
  {
    slug: "ec2-deployment",
    track: "cloud",
    title: "Deploying to EC2",
    summary:
      "Run a service on a plain virtual machine: AMIs, instance types, security groups, key pairs vs SSM, user data, a reverse proxy, process supervision and TLS — and when to graduate to Auto Scaling groups or containers.",
    level: "beginner",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "coding"],
    status: "outline",
    prerequisites: ["cloud/cloud-providers", "networks/tls-handshake"],
    related: ["cloud/ci-cd", "cloud/docker", "system-design/load-balancing-algorithms"],
    tags: ["aws", "ec2", "deployment", "nginx", "security-groups"],
    sources: [
      { label: "Amazon EC2 User Guide", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html", kind: "docs" },
      { label: "Amazon EC2 security groups", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html", kind: "docs" },
      { label: "AWS Systems Manager Session Manager", url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html", kind: "docs" },
      { label: "Amazon EC2 Auto Scaling", url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Launch an instance: choose an AMI, instance type and subnet; understand public vs private IPs and Elastic IPs",
              "Lock down access with security groups (stateful firewalls) and prefer SSM Session Manager over open SSH",
              "Bootstrap with user data, run the app under a supervisor (systemd, PM2 or Docker), and front it with Nginx/Caddy for TLS",
              "Attach an IAM instance profile instead of copying access keys onto the box",
              "Know when to move to an Auto Scaling group behind an ALB, or to containers",
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
              "EC2 building blocks: AMI, instance types/families, EBS volumes, VPC/subnets, security groups",
              "A step-by-step manual deploy, then the same thing automated from CI",
              "Zero-downtime options on VMs: blue/green behind a load balancer, rolling an Auto Scaling group",
              "Cost basics: on-demand vs reserved/savings plans vs spot",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "cdn-cloudfront",
    track: "cloud",
    title: "CDNs and edge compute: CloudFront and Cloudflare Workers",
    summary:
      "How a CDN caches content at edge locations close to users, how cache keys, TTLs and invalidations work in CloudFront, and how edge compute (CloudFront Functions, Lambda@Edge, Cloudflare Workers) runs code at the edge.",
    level: "intermediate",
    frequency: "medium",
    minutes: 30,
    kinds: ["theory", "system-design"],
    status: "outline",
    prerequisites: ["networks/http-caching", "networks/dns"],
    related: ["system-design/cdn-edge-caching", "system-design/cache-invalidation", "cloud/cloud-providers"],
    tags: ["cdn", "cloudfront", "cloudflare-workers", "edge", "caching"],
    sources: [
      { label: "Amazon CloudFront Developer Guide", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html", kind: "docs" },
      { label: "CloudFront: cache policies and cache keys", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html", kind: "docs" },
      { label: "CloudFront Functions vs Lambda@Edge", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-choosing.html", kind: "docs" },
      { label: "Cloudflare Workers: How Workers works", url: "https://developers.cloudflare.com/workers/reference/how-workers-works/", kind: "docs" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Explain how a request reaches the nearest edge location and what happens on a cache hit vs miss (origin fetch)",
              "Design cache keys and TTLs using `Cache-Control`, and choose between invalidation and versioned (fingerprinted) URLs",
              "Secure an S3 origin with Origin Access Control so it is reachable only through the CDN",
              "Compare CloudFront Functions, Lambda@Edge and Cloudflare Workers (V8 isolates) for edge logic",
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
              "Edge locations, regional caches and origin shielding",
              "Cache keys: which headers, cookies and query strings fragment the cache",
              "Static asset strategy: immutable fingerprinted files + short-TTL HTML",
              "Edge compute use cases: redirects, auth checks, A/B routing, header rewrites — and their limits",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "ci-cd",
    track: "cloud",
    title: "CI/CD pipelines",
    summary:
      "Continuous integration verifies every change automatically; continuous delivery/deployment ships verified artifacts to environments. Learn pipeline stages, build-once-promote-many, secrets handling and safe rollout strategies.",
    level: "intermediate",
    frequency: "high",
    minutes: 30,
    kinds: ["theory", "coding"],
    status: "authored",
    prerequisites: ["cloud/docker", "production/git-workflows"],
    related: ["system-design/deployment-strategies", "production/build-performance", "production/monorepos-turborepo"],
    tags: ["ci", "cd", "github-actions", "pipelines", "deployment"],
    sources: [
      { label: "GitHub Actions documentation", url: "https://docs.github.com/en/actions", kind: "docs" },
      { label: "GitHub Actions: security hardening with OpenID Connect", url: "https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect", kind: "docs" },
      { label: "Docker: GitHub Actions cache backend", url: "https://docs.docker.com/build/cache/backends/gha/", kind: "docs" },
      { label: "Martin Fowler: Continuous Integration", url: "https://martinfowler.com/articles/continuousIntegration.html", kind: "external" },
    ],
    sections: [
      {
        id: "objectives",
        blocks: [
          {
            type: "list",
            items: [
              "Distinguish continuous integration, continuous delivery and continuous deployment",
              "Design a pipeline: lint → test → build image → scan → push → deploy to staging → promote to production",
              "Apply build-once-promote-many and immutable, SHA-tagged artifacts",
              "Keep secrets out of pipelines with OIDC federation and scoped environments",
            ],
          },
        ],
      },
      {
        id: "intuition",
        blocks: [
          { type: "p", text: "CI is a robot reviewer that checks every change the same way, every time, before it can merge. CD is a robot release manager that takes the exact artifact CI approved and moves it through environments. The goal is to make releasing boring: small, frequent, reversible." },
        ],
      },
      {
        id: "definition",
        blocks: [
          {
            type: "table",
            head: ["Term", "Meaning"],
            rows: [
              ["Continuous integration", "Everyone merges to a mainline frequently; each change is automatically built and tested."],
              ["Continuous delivery", "Every passing build is *releasable*; deployment to production is a button press (manual approval)."],
              ["Continuous deployment", "Every passing build is deployed to production automatically."],
              ["Artifact", "The immutable output of a build: a container image, a binary, a bundle — identified by a version or digest."],
            ],
          },
        ],
      },
      {
        id: "walkthrough",
        blocks: [
          {
            type: "code",
            lang: "yaml",
            caption: "A trimmed GitHub Actions workflow. The deploy job uses OIDC to assume a cloud role — no stored keys.",
            code: `name: ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint && npm test

  image:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/ci-deploy
          aws-region: us-east-1
      - run: |
          IMAGE=123456789012.dkr.ecr.us-east-1.amazonaws.com/api:\${{ github.sha }}
          aws ecr get-login-password | docker login --username AWS --password-stdin \${IMAGE%%/*}
          docker build -t "$IMAGE" .
          docker push "$IMAGE"`,
          },
          {
            type: "steps",
            steps: [
              { title: "Fast feedback first", detail: "Lint and unit tests run on every PR; slow suites run in parallel jobs or only on main." },
              { title: "Build once", detail: "The image is tagged with the commit SHA and pushed. Staging and production deploy that same digest — never rebuild per environment." },
              { title: "Short-lived credentials", detail: "`id-token: write` lets the job obtain an OIDC token that the cloud exchanges for a temporary role session, scoped by repository and branch." },
              { title: "Deploy and verify", detail: "Deploy to staging, run smoke tests, then promote (rolling, blue/green or canary) with automatic rollback on failed health checks." },
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
              "Rebuilding the artifact for each environment, so production runs something never tested.",
              "Deploying `latest` — no traceability, no easy rollback.",
              "Long-lived cloud keys in CI secrets, readable by any workflow (including ones triggered from forks if misconfigured).",
              "Flaky tests that people learn to re-run — they erode trust until real failures are ignored.",
              "No caching: reinstalling dependencies and rebuilding every layer on every run.",
            ],
          },
        ],
      },
      {
        id: "tradeoffs",
        blocks: [
          {
            type: "compare",
            items: [
              { title: "Continuous deployment", points: ["Smallest possible changes, fastest feedback", "Requires strong automated tests, monitoring and rollback", "Feature flags decouple deploy from release"] },
              { title: "Continuous delivery with manual gate", points: ["Human approval for production", "Fits regulated environments", "Risks batching many changes into bigger, riskier releases"] },
            ],
          },
        ],
      },
      {
        id: "interview-short",
        blocks: [
          { type: "p", text: "\"CI builds and tests every change on a shared mainline; CD takes the resulting immutable artifact — tagged by commit SHA — and promotes the same artifact through staging to production, either automatically (continuous deployment) or with an approval (continuous delivery). I keep pipelines fast with caching and parallelism, use OIDC instead of stored cloud keys, and deploy with health-gated rolling or canary releases so rollback is just redeploying the previous SHA.\"" },
        ],
      },
      {
        id: "summary",
        blocks: [
          {
            type: "list",
            items: [
              "CI = automatic verification of every change; CD = automatic delivery of verified artifacts.",
              "Build once, tag by SHA, promote the same digest.",
              "Short-lived credentials via OIDC; least-privilege per environment.",
              "Health-gated rollouts and one-step rollback.",
            ],
          },
        ],
      },
    ],
    glossary: [
      { term: "Pipeline", definition: "An ordered set of automated jobs triggered by repository events." },
      { term: "OIDC federation", definition: "CI obtains a signed identity token and exchanges it with the cloud for temporary credentials, removing stored secrets." },
      { term: "Canary release", definition: "Deploying a new version to a small slice of traffic first and expanding only if metrics stay healthy." },
      { term: "Feature flag", definition: "A runtime switch that enables code for some users without a new deployment." },
    ],
    followUps: [
      { q: "How do you roll back quickly?", a: "Because artifacts are immutable and SHA-tagged, rollback is redeploying the previous known-good digest. Database migrations must be backward compatible (expand/contract) so the old version still works with the new schema." },
      { q: "What is the difference between continuous delivery and continuous deployment?", a: "Delivery: every passing build could be released, but a human triggers production. Deployment: every passing build goes to production automatically." },
    ],
    quiz: [
      {
        id: "ci-cd-q1",
        prompt: "Why should staging and production deploy the same image digest?",
        options: ["It is cheaper to store", "So production runs exactly what was tested", "Registries require it", "To avoid DNS caching"],
        answer: 1,
        explanation: "Rebuilding can pick up different dependency versions or base images. Promoting the same digest guarantees the tested artifact is the one released.",
      },
      {
        id: "ci-cd-q2",
        prompt: "What does granting a GitHub Actions job `id-token: write` enable?",
        options: ["Writing to the repository", "Requesting an OIDC token to exchange for short-lived cloud credentials", "Publishing packages", "Editing secrets"],
        answer: 1,
        explanation: "The job can request a signed OIDC token from GitHub, which a cloud provider trusts to issue temporary credentials for a configured role.",
      },
    ],
  },
];
