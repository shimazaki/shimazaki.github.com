; Author: Shigenobu Hirose at JAMSTEC
; based on original paper
; Shimazaki and Shinomoto, Neural Computation 19, 1503-1527, 2007
;
function sshist, data, x=x, cost=cost, nbin=nbin

  COMPILE_OPT idl2

  nbin_min = 2
  nbin_max = 200

  ntrial = nbin_max - nbin_min + 1

  nbin  = INDGEN(ntrial) + nbin_min

  delta = FLTARR(ntrial)
  cost  = FLTARR(ntrial)

  for n = 0, ntrial-1  do begin
     delta[n] = (MAX(data) - MIN(data)) / (nbin[n] - 1)

     k = HISTOGRAM(data, nbins=nbin[n])

     kmean = MEAN(k)
     kvari = MEAN((k - kmean)^2)
     cost[n] = (2. * kmean - kvari) / delta[n]^2
  endfor

  n = (WHERE(cost eq MIN(cost)))[0]
  k = HISTOGRAM(data, nbins=nbin[n], locations=x)

  return, k

end
