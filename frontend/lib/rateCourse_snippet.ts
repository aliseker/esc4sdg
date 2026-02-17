
export async function rateCourse(courseId: number, score: number, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/courses/${courseId}/rate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
    });
    if (res.status === 401) handleUser401();
    if (!res.ok) throw new Error(await readErrorMessage(res));
}
