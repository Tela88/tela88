type QueryValue = string | number | boolean | null | undefined;

type SelectOptions = {
  select?: string;
  order?: string;
  limit?: number;
  filters?: Record<string, QueryValue>;
};

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return {
    url: url.replace(/\/$/, ""),
    key: serviceRoleKey,
  };
}

function buildUrl(table: string, options: SelectOptions = {}) {
  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/${table}`);

  if (options.select) {
    url.searchParams.set("select", options.select);
  }

  if (options.order) {
    url.searchParams.set("order", options.order);
  }

  if (typeof options.limit === "number") {
    url.searchParams.set("limit", String(options.limit));
  }

  for (const [key, value] of Object.entries(options.filters ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, `eq.${value}`);
    }
  }

  return url;
}

async function request<T>(url: URL, init: RequestInit = {}) {
  const config = getSupabaseConfig();
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Supabase request failed: ${response.status} ${details}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function selectRows<T>(table: string, options: SelectOptions = {}) {
  return request<T[]>(buildUrl(table, options));
}

export async function selectSingle<T>(table: string, options: SelectOptions = {}) {
  const rows = await selectRows<T>(table, { ...options, limit: 1 });
  return rows[0] ?? null;
}

export async function insertRow<T>(table: string, payload: object) {
  const rows = await request<T[]>(
    buildUrl(table),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return rows[0] ?? null;
}

export async function updateRows<T>(table: string, filters: Record<string, QueryValue>, payload: object) {
  const rows = await request<T[]>(
    buildUrl(table, { filters }),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return rows;
}

export async function deleteRows<T>(table: string, filters: Record<string, QueryValue>) {
  return request<T[]>(
    buildUrl(table, { filters }),
    {
      method: "DELETE",
    },
  );
}
