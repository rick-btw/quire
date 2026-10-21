import type { APIRoute, GetStaticPaths } from 'astro';
import { paletteFor, renderGraphSvg, themeVars } from '../lib/readme-graph';
import { noteHref } from '../lib/url';
import { toGraphData } from '../lib/vault/graph';
import { getVaultIndex } from '../lib/vault/index';
import tokens from '../styles/tokens.css?raw';

export const getStaticPaths: GetStaticPaths = () => [{ params: { theme: 'light' } }, { params: { theme: 'dark' } }];

/** `graph-light.svg` and `graph-dark.svg`: the whole graph as a picture for the README, redrawn on every build. */
export const GET: APIRoute = ({ params }) => {
  const data = toGraphData(getVaultIndex(), (id) => noteHref(id));
  const svg = renderGraphSvg(data, paletteFor(data, themeVars(tokens, params.theme === 'dark')));
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
