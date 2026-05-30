# CONTINUAR — Guía de build

## Antes del primer comando

Cierra los 18 ítems de `BUILD-READY.md`. Cuando todos estén en sí, arranca.

---

## Loop por tarea (repetir T01 → T17)

```bash
# 1. Crear rama desde develop
git checkout develop && git pull
git checkout -b feat/<nombre-tarea>   # ej. feat/t01-scaffold

# 2. Invocar al implementer
# "Implementa T01 de plan.md"
# El agente lista archivos → pides aprobación → implementa.

# 3. Revisar con el reviewer
# "Revisa el diff de esta rama"
# Si hay bloqueantes: corregir antes de commitear.

# 4. Commit atómico y merge
git add <archivos exactos>
git commit -m "feat(<scope>): <descripción en infinitivo>"
git checkout develop && git merge feat/<nombre-tarea>
git branch -d feat/<nombre-tarea>
```

Una tarea = una rama = un commit. No mezclar tareas en la misma rama.

---

## Si el implementer se atora dos veces

1. Editar el archivo manualmente.
2. Abrir `CONTEXT.md` y añadir una entrada:
   - Archivo modificado, líneas afectadas, motivo de la edición manual.
3. Continuar con el paso 3 del loop (reviewer).

---

## Cuándo usar `release/` y `hotfix/`

**`release/`** — al terminar un grupo de tareas listo para desplegar a Vercel:
```bash
git checkout -b release/v0.1.0   # desde develop
# ajustes finales de producción (env, versión)
git checkout main && git merge release/v0.1.0
git tag v0.1.0
git checkout develop && git merge release/v0.1.0
git branch -d release/v0.1.0
```

**`hotfix/`** — si hay un bug crítico en `main` con usuarios activos:
```bash
git checkout -b hotfix/<descripcion>   # desde main
# fix mínimo
git checkout main && git merge hotfix/<descripcion>
git checkout develop && git merge hotfix/<descripcion>
git branch -d hotfix/<descripcion>
```
