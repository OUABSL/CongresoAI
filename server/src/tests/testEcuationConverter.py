import re
import sympy as sp
from sympy.parsing.latex import parse_latex

def convert_equations_to_text(latex_content):
    """
    Procesa y limpia todas las expresiones matemáticas del contenido LaTeX, convirtiéndolas en texto plano legible.

    Parámetros:
        latex_content (str): El contenido de LaTeX como una cadena.

    Devoluciones:
        str: El contenido modificado de LaTeX con expresiones matemáticas reemplazadas por representaciones de texto.
    """
    def replace_equation(match):
        equation = match.group(1)
        try:
            parsed_expr = parse_latex(equation)
            readable_expr = str(parsed_expr)
            return f"[EM: {readable_expr}]"
        except Exception as e:
            return f"[EM without formatting: {equation}]"

    # Patrones para ecuaciones en línea y de bloque
    inline_pattern = re.compile(r'\$(.+?)\$')
    block_pattern = re.compile(r'\$\$(.+?)\$\$')

    # Reemplazar ecuaciones en línea
    latex_content = inline_pattern.sub(replace_equation, latex_content)

    # Reemplazar ecuaciones de bloque
    latex_content = block_pattern.sub(replace_equation, latex_content)

    return latex_content


if __name__ == "__main__":
    # Datos de prueba
    latex_content_test = [
        """
        El siguiente resultado indica que duplicar nodos positivos no cambia el \\textit{significado} de las consultas.

        \\begin{definition}{}
            Dado $G=(V,E,\\mu)$, y $W\\subseteq V$, definimos el \\emph{clon de $G$ mediante duplicación de $W$}, $Cl_G^W$, como:
            
            $$Cl_G^W=(V \\cup W', E \\cup E', \\mu \\cup \\{(n', \\mu(n))\\}_{n \\in W} \\cup \\{(e', \\mu(e))\\}_{e' \\in E'})$$
            donde $W' = \\{n'\\ :\\ n \\in W\\}$ son nuevos nodos clonados a partir de $W$, y $E'$ es un conjunto de nuevas aristas obtenidas a partir de las aristas incidentes en los nodos de $W$, donde los nodos de $W$ son reemplazados por copias de $W'$ (las aristas que conectan nodos originales con nodos clonados y las que conectan nodos clonados, también se clonan).
        \\end{definition}\\medskip
        """,
        """
        A continuación, se agrega un predicado adicional a una arista existente mediante la siguiente operación, limitada a aristas positivas que conectan nodos positivos.

        \\begin{theorem}{(Agregar predicado a una arista positiva entre nodos positivos)}
            Si $n,m\\in V_Q^+$, con $n\\stackrel {e^+}{\\longrightarrow} m$, y $\\varphi\\in Form^2(L)$, el conjunto $Q+\\{n\\stackrel {e \\wedge \\varphi}{\\longrightarrow} m\\}$, formado por:
            \\begin{align*}
            Q_1 &= (V_{Q'},\\ E_{Q'}\\cup\\{n^+\\stackrel {e'}{\\longrightarrow} m^+},\\ \\theta_{Q'}\\cup(e',\\theta_e\\wedge \\varphi)), \\
            Q_2 &= (V_{Q'},\\ E_{Q'}\\cup\\{n^+\\stackrel {e'}{\\longrightarrow} m^-},\\ \\theta_{Q'}\\cup(e',\\theta_e\\wedge \\varphi)), \\
            Q_3 &= (V_{Q'},\\ E_{Q'}\\cup\\{n^-\\stackrel {e'}{\\longrightarrow} m^+},\\ \\theta_{Q'}\\cup(e',\\theta_e\\wedge \\varphi)), \\
            Q_4 &= (V_{Q'},\\ E_{Q'}\\cup\\{n^-\\stackrel {e'}{\\longrightarrow} m^-},\\ \\theta_{Q'}\\cup(e',\\theta_e\\wedge \\varphi))
            \\end{align*}
            (donde $Q'=Cl_Q^{\\{n,m\\}}$) es un conjunto de refinamiento de $Q$ en $G$ (Fig. \\ref{ref3}).
        \\end{theorem}
        \\begin{proof}{}
            La prueba es similar a las anteriores.
        \\end{proof}
        """  
    ]

    for test in latex_content_test:
        print(convert_equations_to_text(test))
