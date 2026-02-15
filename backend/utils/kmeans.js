function distance(a, b) {
    return Math.sqrt(
        Math.pow(a.pH - b.pH, 2) +
        Math.pow(a.turbidity - b.turbidity, 2)
    );
}

function kmeans(data, k = 3) {
    let centroids = data.slice(0, k);

    for (let i = 0; i < 5; i++) {
        let clusters = Array.from({ length: k }, () => []);

        data.forEach(point => {
            let distances = centroids.map(c => distance(point, c));
            let clusterIndex = distances.indexOf(Math.min(...distances));
            clusters[clusterIndex].push(point);
            point.cluster = clusterIndex;
        });

        centroids = clusters.map(cluster => {
            if (cluster.length === 0) return { pH: 0, turbidity: 0 };
            let avgPH = cluster.reduce((sum, p) => sum + p.pH, 0) / cluster.length;
            let avgTur = cluster.reduce((sum, p) => sum + p.turbidity, 0) / cluster.length;
            return { pH: avgPH, turbidity: avgTur };
        });
    }

    return data;
}

module.exports = kmeans;
